"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState,useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
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

//const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), { ssr: false });

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DataPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isClient, setIsClient] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    setIsClient(true); // Ensure Chart.js only loads on client
    setChartKey((prev) => prev + 1);
  }, []);


  const chartColors = [
    "rgb(148, 0, 211)",  // 400 nm (Violet)
    "rgb(75, 0, 130)",   // 430 nm (Indigo)
    "rgb(0, 0, 255)",    // 460 nm (Blue)
    "rgb(0, 255, 255)",  // 490 nm (Cyan)
    "rgb(0, 255, 0)",    // 520 nm (Green)
    "rgb(173, 255, 47)", // 550 nm (Yellow-Green)
    "rgb(255, 255, 0)",  // 580 nm (Yellow)
    "rgb(255, 165, 0)",  // 600 nm (Orange)
    "rgb(255, 69, 0)",   // 620 nm (Red-Orange)
    "rgb(255, 0, 0)",    // 640 nm (Red)
    "rgb(139, 0, 0)",    // 660 nm (Deep Red)
    "rgb(128, 0, 0)"     // 700 nm (Near Infrared Edge)
  ];
    const chartData = (color: string) =>{
      const data = {
      labels: Array.from({length: 250},(_, i) => (i + 1).toString()),   
      datasets: [
        {
          data: Array.from({length: 250}, () => Math.floor(Math.random() * 1000) + 1),
          borderColor: color,
          fill: false,
          tension: .1,
        },
      ],
    };
    console.log("Chart Data:", data); // Debug: Log chart data
    return data;
  };


  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
      },
      y:{
        beginAtZero: true,
      }
      
    },
  }


  return (
    <div className="w-full flex-wrap min-h-screen flex flex-col overflow-y-auto p-4">
      <div className="w-full flex-grow overflow-y-auto">
      
      <Card className="w-full h-40 p-2 mb-2 flex-shrink-0 bg-white shadow-sm rounded-sm">
      <CardHeader> 
          <CardTitle className="text-2xl">Select a Date</CardTitle>
          <CardDescription className="text-m">Choose a day to view the data</CardDescription>
      </CardHeader>
        
        <CardContent>
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
        </CardContent>
       
        
        <CardFooter className="flex justify-center">
        </CardFooter>
      </Card>

      
        {chartColors.map((color, index) => (
       <Card key={index} className="bg-white shadow-md rounded-lg p-4 min-h-[250px] mb-4">
        <CardHeader>
        <CardTitle className="text-l">Chart {index + 1}</CardTitle>
        <CardDescription className="text-s">{date && <p>Data from {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="w-full h-auto">
            <Line data={chartData(color)} options={chartOptions} />
          </div>
        </CardContent>
        </Card>
         ))}
      
       </div>
    </div>
        
  );
}
