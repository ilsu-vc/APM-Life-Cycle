import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine, Image as ImageIcon, History, QrCode } from 'lucide-react';

export function QRScanner() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-navy-950 tracking-tight">QR Scanner</h1>
        <p className="text-sm text-navy-600">Scan delivery receipts or inventory items (Prototype Mockup)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-navy-200 shadow-sm overflow-hidden bg-navy-950 text-white relative">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <ScanLine className="w-5 h-5 text-gold-400" />
              Scanner Viewfinder
            </CardTitle>
            <CardDescription className="text-navy-400">Position the QR code within the frame</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-12 min-h-[400px]">
            {/* Viewfinder Mockup */}
            <div className="relative w-64 h-64 border-2 border-gold-500/30 rounded-xl flex items-center justify-center overflow-hidden bg-navy-900/50 backdrop-blur-sm">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-gold-500 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-gold-500 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-gold-500 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-gold-500 rounded-br-xl" />
              
              {/* Static scan line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gold-400/50 -translate-y-1/2 z-10" />
              
              <div className="opacity-30 flex flex-col items-center justify-center gap-3">
                <QrCode className="w-20 h-20 text-white" />
                <span className="text-xs font-black uppercase tracking-widest text-white">Align QR Code</span>
              </div>
            </div>

            <div className="mt-12 flex gap-4 w-full max-w-[256px]">
              <Button variant="outline" className="flex-1 border-navy-700 bg-navy-800/50 text-white hover:bg-navy-700 hover:text-white backdrop-blur-sm">
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </Button>
              <Button className="flex-1 bg-gold-500 text-navy-950 hover:bg-gold-400 font-bold">
                Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-navy-950">
              <History className="w-5 h-5 text-gold-500" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock history items */}
              <div className="flex items-center justify-between p-3 bg-navy-50 hover:bg-navy-100 transition-colors rounded-lg border border-navy-100 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-navy-900">ORD-100254</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-navy-500">Delivery Receipt</span>
                </div>
                <span className="text-[10px] font-bold text-navy-400">2m ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-navy-50 hover:bg-navy-100 transition-colors rounded-lg border border-navy-100 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-navy-900">AP-RD-001</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-navy-500">Inventory Tag</span>
                </div>
                <span className="text-[10px] font-bold text-navy-400">1h ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-navy-50 hover:bg-navy-100 transition-colors rounded-lg border border-navy-100 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-navy-900">WH-Transfer-88</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-navy-500">Gate Pass</span>
                </div>
                <span className="text-[10px] font-bold text-navy-400">3h ago</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-navy-50 rounded-xl border border-navy-100 text-center">
              <QrCode className="w-8 h-8 text-navy-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-navy-600">This is a prototype view. Camera integration will be active in the production build.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
