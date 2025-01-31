"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState } from "react";
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
import { Line } from 'react-chartjs-2'

// test

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
  

  
  
    const chartData = {
      labels: ["1s", "2s", "3s", "4s", "5s"],
      datasets: [
        {
    
          data: [10, 8, 3, 25, 12], // Dummy data
          fill: true,
          borderColor: "rgb(15, 12, 222)",
          tension: .1,
        },
      ],
    };

  
  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      
    },
  }


  return (
    <div className="w-full flex-wrap h-screen flex flex-col">
      
      <Card className="w-full p-2 mb-2 flex-shrink-0 bg-white shadow-sm rounded-sm">
      <CardHeader>
          <CardTitle className="text-3xl">Select a Date</CardTitle>
          <CardDescription className="text-lg">Choose a day to view the data</CardDescription>
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

      <div className="flex-grow w-full">
        <div className="w-full h-full">
      <Card className="p-8 flex-grow bg-white shadow-lg rounded-lg">
        <CardHeader>
        <CardTitle className="text-xl">Data Visualization</CardTitle>
        <CardDescription className="text-lg">{date && <p>Data from {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-lg">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
        </Card>
      </div>
      </div>
      </div>
  );
}
