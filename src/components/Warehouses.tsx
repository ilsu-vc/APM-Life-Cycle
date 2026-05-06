import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Warehouse as WarehouseIcon, Plus, MapPin, Package, AlertCircle, Image as ImageIcon, Edit2, Trash2, ArchiveRestore, Clock, User as UserIcon } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Warehouse, InventoryItem, Product } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

// Image Compression for Base64 storage
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export function Warehouses() {
  const { profile } = useAuth();
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [imageUpload, setImageUpload] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [warehouseToArchive, setWarehouseToArchive] = useState<Warehouse | null>(null);

  const [isArchivedListOpen, setIsArchivedListOpen] = useState(false);

  // Drag to reorder
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) return;

    const newOrder = [...activeWarehouses];
    const [draggedItem] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    const updatedWarehouses = newOrder.map((w, i) => ({ ...w, order: i }));

    const updatedAll = allWarehouses.map(w => {
       const found = updatedWarehouses.find(uw => uw.id === w.id);
       return found ? found : w;
    });
    setAllWarehouses(updatedAll);
    setDraggedIdx(null);

    try {
      await Promise.all(
        updatedWarehouses.map(w => updateDoc(doc(db, 'warehouses', w.id), { order: w.order }))
      );
    } catch (error) {
      console.error("Failed to save new order", error);
      toast.error("Failed to save tab order");
    }
  };

  // Derived
  const activeWarehouses = [...allWarehouses]
    .filter(w => w.status !== 'archived')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const archivedWarehouses = [...allWarehouses]
    .filter(w => w.status === 'archived')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wSnap, iSnap, pSnap] = await Promise.all([
          getDocs(collection(db, 'warehouses')),
          getDocs(collection(db, 'inventory')),
          getDocs(collection(db, 'products'))
        ]);
        
        const wData = wSnap.docs.map(d => ({ id: d.id, ...d.data() } as Warehouse));
        setAllWarehouses(wData);
        
        const active = wData.filter(w => w.status !== 'archived');
        if (active.length > 0 && !selectedWarehouseId) {
          setSelectedWarehouseId(active[0].id);
        }

        setInventory(iSnap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      } catch (e) {
        console.error(e);
        toast.error("Failed to load warehouse data");
      }
    };
    fetchData();
  }, []);

  // Ensure valid selected warehouse
  useEffect(() => {
    if (selectedWarehouseId) {
      const w = activeWarehouses.find(wh => wh.id === selectedWarehouseId);
      if (!w && activeWarehouses.length > 0) {
        setSelectedWarehouseId(activeWarehouses[0].id);
      }
    } else if (activeWarehouses.length > 0) {
      setSelectedWarehouseId(activeWarehouses[0].id);
    }
  }, [activeWarehouses, selectedWarehouseId]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await compressImage(e.target.files[0]);
        setImageUpload(base64);
      } catch (error) {
        toast.error("Failed to process image");
      }
    }
  };

  const handleAddWarehouse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const newWh: Omit<Warehouse, 'id'> = {
        name: formData.get('name') as string,
        location: formData.get('location') as string,
        address: formData.get('address') as string,
        status: 'active',
        photoUrl: imageUpload || undefined
      };
      const docRef = await addDoc(collection(db, 'warehouses'), newWh);
      const added = { id: docRef.id, ...newWh } as Warehouse;
      setAllWarehouses([...allWarehouses, added]);
      setIsAddOpen(false);
      setImageUpload(null);
      setSelectedWarehouseId(docRef.id);
      toast.success("Warehouse created successfully");
    } catch (e) {
      toast.error("Failed to create warehouse");
    }
  };

  const handleEditWarehouse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    const formData = new FormData(e.currentTarget);
    try {
      const updates: Partial<Warehouse> = {
        name: formData.get('name') as string,
        location: formData.get('location') as string,
        address: formData.get('address') as string,
      };
      if (imageUpload) {
        updates.photoUrl = imageUpload;
      }
      await updateDoc(doc(db, 'warehouses', editingWarehouse.id), updates);
      
      setAllWarehouses(allWarehouses.map(w => 
        w.id === editingWarehouse.id ? { ...w, ...updates } : w
      ));
      
      setIsEditOpen(false);
      setEditingWarehouse(null);
      setImageUpload(null);
      toast.success("Warehouse updated successfully");
    } catch (e) {
      toast.error("Failed to update warehouse");
    }
  };

  const confirmArchive = async () => {
    if (!warehouseToArchive) return;
    try {
      const updates = {
        status: 'archived',
        archivedAt: new Date().toISOString(),
        archivedBy: profile?.displayName || 'Unknown Admin'
      };
      await updateDoc(doc(db, 'warehouses', warehouseToArchive.id), updates);
      
      setAllWarehouses(allWarehouses.map(w => 
        w.id === warehouseToArchive.id ? { ...w, ...updates } as Warehouse : w
      ));
      
      setIsArchiveConfirmOpen(false);
      setWarehouseToArchive(null);
      toast.success("Warehouse moved to archives");
    } catch (e) {
      toast.error("Failed to archive warehouse");
    }
  };

  const handleRecover = async (wh: Warehouse) => {
    try {
      const updates = {
        status: 'active',
        archivedAt: null,
        archivedBy: null
      };
      await updateDoc(doc(db, 'warehouses', wh.id), updates);
      
      setAllWarehouses(allWarehouses.map(w => 
        w.id === wh.id ? { ...w, status: 'active', archivedAt: undefined, archivedBy: undefined } as Warehouse : w
      ));
      
      toast.success("Warehouse recovered successfully");
    } catch (e) {
      toast.error("Failed to recover warehouse");
    }
  };

  const selectedWarehouse = activeWarehouses.find(w => w.id === selectedWarehouseId);
  const warehouseInventory = inventory.filter(i => i.warehouseId === selectedWarehouseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-navy-950 flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-gold-500" />
            Warehouse Management
          </h2>
          <p className="text-xs text-navy-500 font-medium mt-1 tracking-tight">Monitor stock levels across all regional nodes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsArchivedListOpen(true)}
            className="h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] border-2 border-zinc-200 text-zinc-500 hover:text-navy-950 hover:bg-zinc-50"
          >
            <ArchiveRestore className="w-4 h-4 mr-2" /> Archived Hubs
          </Button>
          <Button 
            onClick={() => {
              setImageUpload(null);
              setIsAddOpen(true);
            }}
            className="bg-navy-950 text-white hover:bg-navy-800 h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Another Warehouse
          </Button>
        </div>
      </div>

      {activeWarehouses.length > 0 ? (
        <div className="flex flex-col gap-6">
          {/* Top Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b-2 border-zinc-100 pb-px [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeWarehouses.map((w, index) => (
              <button 
                key={w.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => setSelectedWarehouseId(w.id)}
                className={`flex flex-col items-start gap-1.5 px-6 py-4 border-b-4 transition-all whitespace-nowrap outline-none rounded-t-2xl min-w-[200px] cursor-grab active:cursor-grabbing ${
                  selectedWarehouseId === w.id 
                    ? 'border-gold-500 bg-gold-50/30 text-navy-950' 
                    : 'border-transparent text-zinc-400 hover:bg-zinc-50 hover:text-navy-950 hover:border-zinc-200'
                } ${draggedIdx === index ? 'opacity-50' : 'opacity-100'}`}
              >
                <div className={`font-black text-sm uppercase tracking-tight ${selectedWarehouseId === w.id ? 'text-navy-950' : 'text-zinc-500'}`}>{w.name}</div>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${selectedWarehouseId === w.id ? 'text-gold-600' : 'text-zinc-400'}`}>
                  <MapPin className="w-3 h-3" />
                  {w.location}
                </div>
              </button>
            ))}
          </div>

          {/* Warehouse Details & Stock */}
          <div className="w-full space-y-6">
            {selectedWarehouse && (
              <Card className="border-2 border-zinc-100 shadow-sm rounded-[2rem] overflow-hidden relative">
                
                {/* Optional Warehouse Photo Background */}
                {selectedWarehouse.photoUrl && (
                  <div className="absolute top-0 right-0 w-1/3 h-48 opacity-10 pointer-events-none">
                    <img src={selectedWarehouse.photoUrl} className="w-full h-full object-cover rounded-bl-full" alt="Warehouse background" />
                  </div>
                )}

                <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-6 pt-6 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-black uppercase tracking-tight text-navy-950 flex items-center gap-3">
                        {selectedWarehouse.photoUrl && (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                            <img src={selectedWarehouse.photoUrl} alt="Warehouse" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {selectedWarehouse.name}
                      </CardTitle>
                      <CardDescription className="flex items-start gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                        <span className="text-xs font-medium text-zinc-600">{selectedWarehouse.address || 'No detailed address provided.'}</span>
                      </CardDescription>
                    </div>

                    {/* Quick Action Buttons for Edit/Archive */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-8 h-8 rounded-full border-zinc-200 text-zinc-400 hover:text-navy-950 hover:bg-zinc-100"
                        onClick={() => {
                          setEditingWarehouse(selectedWarehouse);
                          setImageUpload(selectedWarehouse.photoUrl || null);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="w-8 h-8 rounded-full border-zinc-200 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500"
                        onClick={() => {
                          setWarehouseToArchive(selectedWarehouse);
                          setIsArchiveConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Current Stock Inventory</h4>
                  {warehouseInventory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {warehouseInventory.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <div key={item.id} className="p-5 rounded-2xl border-2 border-zinc-100 bg-white hover:border-zinc-200 transition-colors shadow-sm flex flex-col h-full group">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gold-600 bg-gold-100 px-2 py-1 rounded-md">{product.category}</span>
                              <span className="text-xs font-black text-navy-900 bg-zinc-100 px-2 py-1 rounded-md">₱{product.basePrice.toLocaleString()}</span>
                            </div>
                            <h5 className="font-bold text-sm tracking-tight text-zinc-900 leading-tight mb-2 group-hover:text-gold-600 transition-colors">{product.name}</h5>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 mb-6 flex-1 font-medium">{product.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-zinc-100">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Available</span>
                              <div className="flex items-center gap-2">
                                <Package className={`w-4 h-4 ${item.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                                <span className={`text-base font-black ${item.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                      <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">No stock found in this warehouse.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl">
          <WarehouseIcon className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No Warehouses Configured</p>
          <Button 
            variant="outline" 
            className="mt-4 border-2 font-bold uppercase text-[10px] tracking-widest"
            onClick={() => {
              setImageUpload(null);
              setIsAddOpen(true);
            }}
          >
            Create Your First Warehouse
          </Button>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Add Warehouse */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Add New Warehouse</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddWarehouse} className="space-y-4 pt-4">
            <div className="flex justify-center mb-6">
              <div 
                className="w-24 h-24 rounded-full border-4 border-zinc-100 bg-zinc-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUpload ? (
                  <img src={imageUpload} alt="Upload" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-300" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Warehouse Name</Label>
              <Input id="name" name="name" required placeholder="e.g., Main Distribution Hub" className="rounded-xl border-2 border-zinc-100 h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Region / Location Zone</Label>
              <Input id="location" name="location" required placeholder="e.g., Metro Manila" className="rounded-xl border-2 border-zinc-100 h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Address</Label>
              <Input id="address" name="address" required placeholder="123 Logistics Ave..." className="rounded-xl border-2 border-zinc-100 h-12" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full h-12 bg-navy-950 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-navy-800">
                Register Warehouse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Edit Warehouse */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Edit Warehouse</DialogTitle>
          </DialogHeader>
          {editingWarehouse && (
            <form onSubmit={handleEditWarehouse} className="space-y-4 pt-4">
              <div className="flex justify-center mb-6">
                <div 
                  className="w-24 h-24 rounded-full border-4 border-zinc-100 bg-zinc-50 flex items-center justify-center overflow-hidden cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUpload ? (
                    <img src={imageUpload} alt="Upload" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-zinc-300" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Warehouse Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingWarehouse.name} required className="rounded-xl border-2 border-zinc-100 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Region / Location Zone</Label>
                <Input id="edit-location" name="location" defaultValue={editingWarehouse.location} required className="rounded-xl border-2 border-zinc-100 h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Address</Label>
                <Input id="edit-address" name="address" defaultValue={editingWarehouse.address} required className="rounded-xl border-2 border-zinc-100 h-12" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-12 bg-navy-950 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-navy-800">
                  Update Details
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Confirm Archive */}
      <Dialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-red-500 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Archive Warehouse
            </DialogTitle>
            <DialogDescription className="pt-4 font-medium text-zinc-600">
              Are you sure you want to delete <strong className="text-zinc-900">{warehouseToArchive?.name}</strong>? 
              <br/><br/>
              This will not permanently erase the data. It will be moved to the archives and can be recovered later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-6">
            <Button variant="ghost" onClick={() => setIsArchiveConfirmOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={confirmArchive} className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">Yes, Archive It</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Archived List */}
      <Dialog open={isArchivedListOpen} onOpenChange={setIsArchivedListOpen}>
        <DialogContent className="rounded-[2rem] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-zinc-100">
            <DialogTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-zinc-400">
              <ArchiveRestore className="w-6 h-6" />
              Archived Warehouses
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            {archivedWarehouses.length > 0 ? (
              archivedWarehouses.map(aw => (
                <div key={aw.id} className="p-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    {aw.photoUrl ? (
                      <img src={aw.photoUrl} alt="Archived" className="w-12 h-12 rounded-full object-cover border-2 border-zinc-200 grayscale" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center grayscale">
                        <WarehouseIcon className="w-5 h-5 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-sm uppercase text-zinc-500 line-through decoration-zinc-300">{aw.name}</h4>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                          <UserIcon className="w-3 h-3" />
                          Deleted by <span className="font-bold text-zinc-600">{aw.archivedBy || 'System'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {aw.archivedAt ? new Date(aw.archivedAt).toLocaleString() : 'Unknown Date'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleRecover(aw)}
                    variant="outline"
                    className="h-8 px-4 rounded-lg font-bold uppercase tracking-widest text-[10px] border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 shrink-0"
                  >
                    Recover
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                <ArchiveRestore className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">No archived warehouses found.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
