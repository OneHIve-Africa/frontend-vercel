import React, { useEffect, useState } from "react";
// @ts-ignore
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";

interface ProductionHeatmapProps {
  data: Array<{ region: string; liters: number }>;
}

const ProductionHeatmap: React.FC<ProductionHeatmapProps> = ({ data }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/assets/ghana_regions.json")
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error("Error loading Ghana GeoJSON:", error));
  }, []);

  // Create a map of region names to values for easier lookup
  const dataMap = React.useMemo(() => {
    return data.reduce((acc, cur) => {
      // Normalize region names: lowercase, strip "region"
      const key = cur.region.toLowerCase().replace(" region", "").trim();
      acc[key] = cur.liters;
      return acc;
    }, {} as Record<string, number>);
  }, [data]);

  // Determine max value for the color scale
  const maxVal = Math.max(...data.map((d) => d.liters), 0);
  
  // Create color scale
  const colorScale = scaleLinear<string>()
    .domain([0, maxVal || 1])
    .range(["#FFF3E0", "#E65100"]); // Light orange to Dark Burnt Orange

  if (!geoData) {
    return <div className="flex items-center justify-center h-[400px]">Loading Map...</div>;
  }

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-lg relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 3500, // Zoom into Ghana
          center: [-1.0232, 7.9465] // Center on Ghana
        }}
        width={400}
        height={500}
        data-tip=""
      >
        <ZoomableGroup>
          <Geographies geography={geoData}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                // Ensure property matching - adjust based on actual GeoJSON keys (likely NAME_1)
                const regionName = geo.properties.NAME_1 || geo.properties.name || "Unknown";
                const normalizedKey = regionName.toLowerCase().replace(" region", "").trim();
                const value = dataMap[normalizedKey] || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setContent(`${regionName}: ${value.toLocaleString()} L`);
                    }}
                    onMouseLeave={() => {
                      setContent("");
                    }}
                    onClick={() => {
                       console.log(`Clicked ${regionName}`);
                    }}
                    style={{
                      default: {
                        fill: value ? colorScale(value) : "#EEE", // Gray for no data
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: "#F57C00", // Highlight color
                        stroke: "#FFF",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#E65100",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip>{content}</Tooltip>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-md text-xs border border-gray-100">
         <div className="font-semibold mb-2 text-gray-700">Production (L)</div>
         <div className="flex items-center gap-2 mb-1">
            <span className="w-4 h-4 bg-[#E65100] rounded-sm"></span> High
         </div>
         <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-[#FFF3E0] rounded-sm"></span> Low
         </div>
      </div>
    </div>
  );
};

export default ProductionHeatmap;
