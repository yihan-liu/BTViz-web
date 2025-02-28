"use client"

import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts";
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
    "hsl(0, 70%, 50%)",    // Channel 0
    "hsl(30, 70%, 50%)",   // Channel 1
    "hsl(60, 70%, 50%)",   // Channel 2
    "hsl(90, 70%, 50%)",   // Channel 3
    "hsl(120, 70%, 50%)",  // Channel 4
    "hsl(150, 70%, 50%)",  // Channel 5
    "hsl(180, 70%, 50%)",  // Channel 6
    "hsl(210, 70%, 50%)",  // Channel 7
    "hsl(240, 70%, 50%)",  // Channel 8
    "hsl(270, 70%, 50%)",  // Channel 9
    "hsl(300, 70%, 50%)",  // Channel 10
    "hsl(330, 70%, 50%)",  // Channel 11
];

// Build a chart configuration object for each channel.
// If you have an icon like Monitor, you can uncomment the icon property.
const chartConfig = channelColors.reduce((config, color, index) => {
    config[`channel${index}`] = {
        label: `Channel ${index}`,
        // icon: Monitor,
        color: color,
        theme: {
            light: color,
            dark: color, // Optionally adjust for dark mode
        },
    };
    return config;
}, {} as Record<string, { label: string; color: string; theme: { light: string; dark: string } }>) satisfies ChartConfig;

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

    const sampleSensorData: SensorData[] = [
        {
            timestamp: Date.now(),
            values: [100, 120, 90, 110, 105, 95, 130, 125, 115, 100, 90, 85],
        },
        {
            timestamp: Date.now() + 60000, // one minute later
            values: [105, 125, 95, 115, 110, 100, 135, 130, 120, 105, 95, 90],
        },
        {
            timestamp: Date.now() + 120000, // two minutes later
            values: [110, 130, 100, 120, 115, 105, 140, 135, 125, 110, 100, 95],
        },
    ];

    // The data prop should be an array of 12 objects, one for each month.
    return (
        <ChartContainer config={chartConfig}>
            <AreaChart
                accessibilityLayer
                data={sampleSensorData}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={1}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <Area
                    dataKey="desktop"
                    type="linear"
                    fill="var(--color-desktop)"
                    fillOpacity={0.2}
                    stroke="var(--color-desktop)"
                />
            </AreaChart>
        </ChartContainer>
    );
}