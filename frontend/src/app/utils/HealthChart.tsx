"use client"

import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer} from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";



interface SensorData {
    timestamp: number;
    values: number[]; // expected to have 12 values
}

interface SensorChartProps {
    data: SensorData[];
    twocharts?: boolean;
  
}
interface ChannelChartProps {
  data: SensorData[];
  channels: number[];         // e.g. [0,1,2]
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
  if (data.length === 0) {
    console.log("No data provided to transformSensorData");
    return [];
  }
  const transformedData = data.map((entry, index) => {
    const transformed: Record<string, number | string> = {
      time: index, // Use index as a simple time increment (in seconds)
    };
    entry.values.slice(0, 6).forEach((value, i) => {
      transformed[`channel${i}`] = value;
    });
    return transformed;
  });

//   console.log("Transformed Chart Data:", transformedData);
  return transformedData;
}

function getDynamicDomain(data: SensorData[], channels: number[]) {
  if (!data.length) return [0, 1];
  const vals = data.flatMap((d) => channels.map((ch) => d.values[ch]));
  const max = Math.max(...vals, 1);
  return [0, max * 1.1]; // 10 % head-room
}

function buildChartData(
  data: SensorData[],
  channels: number[],
): Record<string, number | string>[] {
  return data.map((row, idx) => {
    const o: Record<string, number | string> = { time: idx };
    channels.forEach((ch) => {
      o[`channel${ch}`] = row.values[ch];
    });
    return o;
  });
}


export function HealthChart({data,channels}: ChannelChartProps) {

    
const [yMin, yMax] = getDynamicDomain(data,channels);
const chartData = buildChartData(data,channels);

    return (
       <div className="h-full w-full">
       <ChartContainer config={chartConfig} className="h-full w-full">
             <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                accessibilityLayer
                data={chartData}
                 margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
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
                        domain={[yMin, yMax]}  // Autoscale domain
                        tickMargin={10}
                        tickFormatter={(value) => Number(value).toFixed(2)}
                       
                        tick={{ fill: "#000" }}
                    />
                 <Tooltip
            content={<ChartTooltipContent />}
            cursor={{ stroke: "#ccc", strokeWidth: 1 }}
          />
                {/* <Legend
                 layout="vertical"  
                    verticalAlign="bottom"
                    align="right"
                    wrapperStyle={{ paddingBottom: "0px" }} // Adjust spacing
                /> */}

                {channelColors.map((color, index) => {
                    const channelKey = `channel${index}`;
                    return (
                        <Area
                            key={channelKey}
                            dataKey={channelKey}
                            type="natural"
                            fill={chartConfig[channelKey].color}
                            fillOpacity={0.1} // Subtle fill for better visibility
                            stroke={chartConfig[channelKey].color}
                           strokeWidth={1.5} // Thicker lines for clarity
                            dot={false}
                           
                        />
                    );
                })}
            </AreaChart>
       </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  
}
