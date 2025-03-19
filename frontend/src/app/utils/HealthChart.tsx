"use client"

import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, Legend} from "recharts";
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

    // The data prop should be an array of 12 objects, one for each month.
    return (
        <ChartContainer config={chartConfig} className="min-h-[100px]">
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                {/* <XAxis
                    dataKey="timestamp"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={1}
                    tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                /> */}
                <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ paddingBottom: "10px" }} // Adjust spacing
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