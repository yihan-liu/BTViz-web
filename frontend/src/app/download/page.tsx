"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState,useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns/format";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon , Clock} from "lucide-react"
import { collection, addDoc, setDoc, doc, getDocs, getDoc,query, where,DocumentData,documentId } from "firebase/firestore"
import { toast } from 'sonner';
import { db } from "../utils/firebaseConfig";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from "@/components/ui/app-sidebar"



export default function DataPage(){

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


  const fetchData = async() =>{
    try{
      
      const formattedDate = date?.toISOString().substring(0, 10);
      const startDate = new Date(`${formattedDate}T${startTime}:00`);  
      const endDate = new Date(`${formattedDate}T${endTime}:00`);  
      const startTimestamp = startDate.toISOString();
      const endTimestamp = endDate.toISOString();
     
      const q = query(collection(db, "spectradermadata"),where(documentId(),'>=',startTimestamp),where(documentId(),'<',endTimestamp));

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
    const headers = ["id","timestamp","notificationTimestamp","deviceName","Environment","Mood","Actiivty","Intensity","Other",...dataHeaders];
    const csvHeader = headers.join(",") + "\n";



  const rows: string[] = [];
  for (const doc of fetchedData) {
    const { id, batchTimestamp, notifications, deviceName, Environment = "", Mood = "", Activity = "", Intensity = "", Other = "" } = doc;
    if (notifications && notifications.length > 0) {
      for (const notification of notifications) {
        const notifTimestamp = notification.timestamp || "";
       
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
      const row = [id, batchTimestamp, "",deviceName, Environment, Mood, Activity, Intensity, Other, ...emptyData];
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
      <div className="flex w-screen">
        <main className="flex-1 flex flex-col overflow-y-auto p-6 gap-6 bg-background">
          {/* Page Title */}
          <h2 className="text-2xl font-bold">Download Data</h2>

          {/* Date & Time Picker Card */}
          <Card className="rounded-2xl border border-border/60 bg-white shadow-lg">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">Select Date & Time</CardTitle>
              <CardDescription>Choose a day and time range to download CSV.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon />
                      {format(date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>
                {[
                  { label: 'Start', value: startTime, set: setStartTime },
                  { label: 'End', value: endTime, set: setEndTime }
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex flex-col">
                    <label className="text-sm font-medium">{label} Time</label>
                    <div className="flex items-center border rounded px-3 py-1">
                      <Clock className="mr-2" />
                      <input
                        type="time"
                        value={value}
                        onChange={e => set(e.target.value)}
                        className="outline-none"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleDownload}
                  className="bg-black text-white py-2 px-4 hover:bg-gray-800"
                >
                  Download CSV
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4"></CardFooter>
          </Card>
        </main>
      </div>

  );
}
