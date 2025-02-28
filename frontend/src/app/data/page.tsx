"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState,useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon } from "lucide-react"
import { Line } from "react-chartjs-2";
import { collection, addDoc, setDoc, doc, getDocs} from "firebase/firestore"




export default function DataPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isClient, setIsClient] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    setIsClient(true); // Ensure Chart.js only loads on client
    setChartKey((prev) => prev + 1);
  }, []);



  

  const handleDownloadClick = () => {
    console.log("Download button clicked");
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
