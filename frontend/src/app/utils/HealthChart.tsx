"use client"

import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
// import { Monitor } from "react-icons/your-icon-library"; // Uncomment if you have an icon

interface SensorData {
    timestamp: number;
    values: number[]; // expected to have 12 values
}

interface SensorChartProps {
    data: SensorData[];
}

// Define a color palette for 12 channels
const channelColors = [
    "hsl(270, 70%, 50%)", // Channel 1: Purple
    "hsl(240, 70%, 50%)", // Channel 2: Blue
    "hsl(120, 70%, 50%)", // Channel 3: Green
    "hsl(60, 70%, 50%)",  // Channel 4: Yellow
    "hsl(0, 70%, 50%)",   // Channel 5: Red
    "hsl(25, 70%, 35%)",  // Channel 6: Brown
    // "hsl(195, 70%, 50%)",  // Channel 7: Teal
    // "hsl(315, 70%, 50%)",  // Channel 8: Pink
    // "hsl(45, 100%, 50%)",  // Channel 9: Gold
    // "hsl(175, 70%, 45%)",  // Channel 10: Sea Green
    // "hsl(15, 85%, 55%)",   // Channel 11: Coral
    // "hsl(200, 85%, 65%)"   // Channel 12: Sky Blue
];

// Build a chart configuration object for each channel.
// If you have an icon like Monitor, you can uncomment the icon property.
const chartConfig = channelColors.reduce((config, color, index) => {
    config[`channel${index}`] = {
        label: `Channel ${index}`,
        // icon: Monitor,
        color: color,
    };
    return config;
}, {} as ChartConfig);

// Transform the sensor data into a format compatible with Recharts:
// Each object will have a timestamp and keys like "channel0", "channel1", … "channel11"
function transformSensorData(data: SensorData[]) {
    return data.map((entry) => {
        const transformed: Record<string, number | string> = {
            timestamp: entry.timestamp,
        };
        entry.values.forEach((value, index) => {
            transformed[`channel${index}`] = value;
        });
        return transformed;
    });
}
export function HealthChart({ data }: SensorChartProps) {

    
    const chartData = transformSensorData(data);


    return (
        <ChartContainer config={chartConfig} className="min-h-[100px] max-h-screen">
            
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 12,
                    right: 12,
                }}
               //width={100}      // Set width to 1000px or any other value
                //height={100}      // Set height to 500px or any other value
            >
                <CartesianGrid vertical={false} />
                {/* { <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={1}
                    tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                /> } */}
                 <YAxis 
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}  // Autoscale domain
                        tickMargin={10}
                    />

                <Legend
                 layout="vertical"  
                    verticalAlign="bottom"
                    align="right"
                    wrapperStyle={{ paddingBottom: "0px" }} // Adjust spacing
                />

                {channelColors.map((color, index) => {
                    const channelKey = `channel${index}`;
                    return (
                        <Area
                            key={channelKey}
                            dataKey={channelKey}
                            type="natural"
                            fill={chartConfig[channelKey].color}
                            fillOpacity={0.0}
                            stroke={chartConfig[channelKey].color}
                           
                        />
                    );
                })}
            </AreaChart>
       
        </ChartContainer>
    );
}