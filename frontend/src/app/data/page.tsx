"use client"; // Required for using useState and other hooks in Next.js 13+ App Router
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';




export default function DataPage() {
  const [data, setData] = useState(null);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Data Page</CardTitle>
          <CardDescription className="text-lg">Display your fetched data here</CardDescription>
        </CardHeader>

        <CardContent>
          {data ? <p className="text-gray-700">{JSON.stringify(data)}</p> : <p>No data available</p>}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button className="bg-blue-500 text-white py-2 px-6 rounded-lg" onClick={() => setData({ example: "Hello, World!" })}>
            Fetch Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
