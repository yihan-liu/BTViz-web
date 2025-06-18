"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState,useEffect,useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { subDays, startOfDay,format, endOfDay } from "date-fns";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon , Clock} from "lucide-react"
import { collection,getDocs,query,where, documentId, onSnapshot,Timestamp,getCountFromServer} from "firebase/firestore"
import { toast } from 'sonner';
import { db } from "../utils/firebaseConfig";
// import useLast30ViaCounts from "@/hooks/useLast30ViaCounts";
// import DailyCountsChart from "@/components/ui/dailyDataChart";
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from "@/components/ui/app-sidebar"
import { useProfile } from "@/app/context/ProfileContext";
import TimePicker from "@/components/ui/timepicker";

export default function DataPage(){
  
  //Sidebar Global Variables
  const {
  profiles,
  setProfiles,
  deviceName,
  setDeviceName,
  open,
  setOpen,
  tempDeviceName,
  setTempDeviceName,
  device,
  setDevice,
  deleteProfile,
} = useProfile();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  // const rows = useLast30ViaCounts();    
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isClient, setIsClient] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  
  useEffect(() => {
    setIsClient(true); // Ensure Chart.js only loads on client
    setChartKey((prev) => prev + 1);
  }, []);






  function handleScan(){
    return
  }


  const fetchData = async() =>{
    try{
      const formattedDate = date?.toISOString().substring(0, 10);
      const startDate = new Date(`${formattedDate}T${startTime}:00`);  
      const endDate = new Date(`${formattedDate}T${endTime}:00`);  
      const startTimestamp = startDate.toISOString();
      const endTimestamp = endDate.toISOString();
     
      const q = query(collection(db, "spectraderma"),where(documentId(),'>=',startTimestamp),where(documentId(),'<',endTimestamp));

      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);

      const fetchedData: any[]= [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const tags = data.tags || {};
        fetchedData.push({ id: doc.id, ...(data as object), Environment: (tags.Environment || []).join("|"), Mood: (tags.Mood|| []).join("|"), 
          Activity:    (tags.Activity    || []).join("|"),
          Intensity:   (tags.Intensity   || []).join("|"),
          Other:       (tags.Other       || []).join("|"), });
      });
      console.log("Fetched Data:", fetchedData);
      setData(fetchedData);
      return fetchedData;
    }
   catch (error) {
    toast.error("Error fetching data: " + error.message);
  }
};

  const handleDownload = async() => {
    const fetchedData = await fetchData();
    if (!fetchedData || fetchedData.length === 0) {
      toast.error("No data available to download.");
      return;
    }
    console.log("Download button clicked");

    let dataArrayLength = 0;
    for(const doc of fetchedData){
      const firstNotif = doc.notifications[0];
      if (firstNotif.data && Array.isArray(firstNotif.data)) {
        dataArrayLength = firstNotif.data.length;
        break;
      }
    } 
    const dataHeaders = [];
    for (let i = 0; i < dataArrayLength; i++) {
      dataHeaders.push(`data_${i}`);
    } 
    const headers = ["id","timestamp","notificationTimestamp","deviceName","Environment","Mood","Activity","Intensity","Other",...dataHeaders];
    const csvHeader = headers.join(",") + "\n";

  const rows: string[] = [];
  for (const doc of fetchedData) {
    const { id, batchTimestamp, notifications, deviceName} = doc;
    if (notifications && notifications.length > 0) {
      for (const notification of notifications) {
        const notifTimestamp = notification.timestamp || "";

        const tags        = notification.tags ?? {};
        const Environment = (tags.Environment ?? []).join("|");
        const Mood        = (tags.Mood        ?? []).join("|");
        const Activity    = (tags.Activity    ?? []).join("|");
        const Intensity   = (tags.Intensity   ?? []).join("|");
        const Other       = (tags.Other       ?? []).join("|");

        const dataArray = notification.data || [];
        const dataValues = [];
        for (let i = 0; i < dataArrayLength; i++) {
          let val = dataArray[i] !== undefined ? dataArray[i] : "";
          if (typeof val === "string") {
            val = val.replace(/"/g, '""');
            val = `"${val}"`;
          }
          dataValues.push(val);
        }
        const row = [id, batchTimestamp, notifTimestamp, deviceName, Environment, Mood, Activity, Intensity, Other, ...dataValues];
        rows.push(row.join(","));
      }
    } else {
      const emptyData = Array(dataArrayLength).fill("");
      const row = [id, batchTimestamp, "",deviceName, "", "", "", "", "", ...emptyData];
      rows.push(row.join(","));
    }
  }

  const csvRowsString = rows.join("\n");
  const csvContent = csvHeader + csvRowsString;
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);

    const link = document.createElement("a")
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `BTVIZ_${date?.toISOString().substring(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  

 
  return (
    <SidebarProvider>
      <div className="flex w-screen">
      <AppSidebar
          isConnected={isConnected}
          onScan={handleScan}
          open={open}
          setOpen={setOpen}
          tempDeviceName={tempDeviceName}
          setTempDeviceName={setTempDeviceName}
    
        onSaveProfile={() => {
        // add to list if it’s new, then make it the active device
        if (tempDeviceName && !profiles.includes(tempDeviceName)) {
          setProfiles([...profiles, tempDeviceName]);
        }
        setDeviceName(tempDeviceName);   // active/selected profile
        setOpen(false);                  // close the dialog
        }}
    
        profiles={profiles}
        deviceName={deviceName}
        setDeviceName={setDeviceName}
        onDeleteProfile={deleteProfile}
      />
      <main className="flex-1 flex flex-col h-screen p-6 gap-6">
          {/* Page Title */}
          <div className="sticky top-0 bg-background z-10 py-2">
          <h2 className="text-3xl font-bold">
            Data Dashboard
                  </h2>
        
        </div>
          {/* Date & Time Picker Card */}
<div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<Card className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm
                 w-full max-w-lg p-4 shadow-md">
  <CardContent className="flex flex-col gap-2">
    <div className="flex flex-wrap items-center gap-2">
      {/* Date picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <CalendarIcon className="h-5 w-5" />   {/* icon 20 px */}
            {format(date as Date, "PPP")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>

      {/* Time pickers */}
      <TimePicker value={startTime} onChange={setStartTime} />
      <TimePicker value={endTime}   onChange={setEndTime} />

      {/* Download button */}
      <Button
        size="sm"
        onClick={handleDownload}>
  Download
</Button>

    </div>
  </CardContent>
</Card>





          </div>
          {/* <Card>
            {isClient && <DailyCountsChart rows={rows} />}
          </Card> */}
        </main>
      </div>
    </SidebarProvider>
  );
}
