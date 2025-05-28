import { FC } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar';
import {
  Bluetooth,
} from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { HardDrive, MoreHorizontal, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  /** BLE state */
  isConnected: boolean;
  onScan: () => void;

  /** “Edit profile” dialog */
  open: boolean;
  setOpen: (v: boolean) => void;
  tempDeviceName: string;
  setTempDeviceName: (v: string) => void;
  onSaveProfile: () => void;

  /** Device list & selection */
  deviceList?: string[];
  selectedDevice?: string | null;
  setSelectedDevice?: (d: string) => void;
 

  profiles: string[];
  deviceName: string;                 // the current / active name
  setDeviceName: (n: string) => void;
  onDeleteProfile: (n: string) => void; 
}

export const AppSidebar: FC<AppSidebarProps> = ({
      isConnected,
      onScan,
      open,
      setOpen,
      tempDeviceName,
      setTempDeviceName,
      onSaveProfile,
      deviceList = [],
      selectedDevice,
      setSelectedDevice,
       profiles,
      deviceName,
      setDeviceName,
      onDeleteProfile
}) => {
  return (
  <Sidebar
      collapsible="icon"
      className={`${'bg-white text-black'} border-r`}
    >
      <SidebarHeader className="p-4 space-y-2">
        <div className="flex items-center space-x-2">
          <Bluetooth className={`h-6 w-6 ${ 'text-purple-500'}`} />
          <CardTitle className="text-2xl font-bold">BLE Dashboard</CardTitle>
        </div>
      </SidebarHeader>

       
    <SidebarContent className="p-4">
  {/* — Devices header — */}
  <div className="mb-1 text-sm font-medium text-black">
    Devices
  </div>

  {/* — Device buttons — */}
  <div className="flex flex-col gap-0.5 pl-3">
  {profiles.map((name) => {
  const active = name === deviceName;
  return (
    <div
      key={name}
      className={cn(
        "group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 font-semibold"
          : "hover:bg-accent/50",
      )}
    >
      {/* main click area */}
      <button
        onClick={() => setDeviceName(name)}
        className="flex flex-1 items-center gap-2 text-black"
      >
        <HardDrive className="h-4 w-4 shrink-0" />
        <span className="truncate">{name}</span>
      </button>

      {/* ︙ trigger + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 opacity-0 transition-opacity
                       group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => onDeleteProfile(name)}
            className="text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
})}
  </div>
  {/* <div className="mt-4 mb-1 text-sm font-medium text-black">Data</div> */}

  {/* <div className="flex flex-col gap-0.5 pl-3">
    <button
      //onClick={}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm
                 text-muted-foreground hover:bg-accent/50 hover:text-foreground
                 transition-colors"
    >
      <Download className="h-4 w-4 shrink-0" />
      Download data
    </button>
  </div> */}
</SidebarContent>


      <SidebarFooter className="p-4 space-y-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Profile</DialogTitle>
              <DialogDescription>Save changes when done.</DialogDescription>
            </DialogHeader>
            <input
              type="text"
              value={tempDeviceName}
              onChange={e => setTempDeviceName(e.target.value)}
              placeholder="Enter Device Name"
              className="w-full mt-2 p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={onSaveProfile}
              className="mt-4 bg-black text-white py-2 px-6 border-2 border-black hover:text-black transition-all duration-300"
            >
              Add Profile
            </Button>
        </DialogContent>

        </Dialog>
        <Button
           onClick={() => {
            console.log("🖱️ Sidebar Connect clicked");
            onScan();
            }}
          className="w-full bg-black text-white py-2 px-6 border-2 border-black hover:text-black transition-all duration-300"
        >
          {isConnected ? 'Reconnect' : 'Connect'}
        </Button>
        <p className="text-xs text-gray-500">© 2025 BTviz</p>
      </SidebarFooter>
    </Sidebar>
  );
};