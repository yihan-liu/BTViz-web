"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState,useEffect } from "react";
import dynamic from "next/dynamic";
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



export default function DataPage() {
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



  const handleDownloadClick = async() => {
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
    <div className="w-full flex-wrap min-h-screen flex flex-col overflow-y-auto p-4">
      <div className="w-full flex-grow overflow-y-auto">
      
      <Card className="w-full h-full p-2 mb-2 flex-shrink-0 bg-white shadow-sm rounded-sm">
        <CardHeader> 
            <CardTitle className="text-2xl">Select a Date</CardTitle>
            <CardDescription className="text-m">Choose a day to view the data and click Download to download data</CardDescription>
        </CardHeader>

          <CardContent>
          <div className="flex items-center space-x-4">
                  <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
                  <div className="flex items-center border rounded px-2 py-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
                  <div className="flex items-center border rounded px-2 py-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

                <Button onClick={handleDownloadClick}
              className="bg-black text-white py-2 px-2  border-2 border-black hover:text-black transition-all duration-300">
                {"Download"}
            </Button>
          </div>
          </CardContent>
          <CardFooter>

          </CardFooter>
      </Card>
       </div>
    </div>
  );
}
