
import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, RefreshCw, Square } from "lucide-react";
import { toast } from "sonner";

type ShapeType = "ellipse" | "polygon" | "circle" | "inset";

interface ControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

const Control: React.FC<ControlProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange, 
  unit = "%" 
}) => {
  return (
    <div className="mb-4 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
      <div className="control-label">
        <span>{label}</span>
        <span className="text-primary font-medium">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full track-appearance"
      />
    </div>
  );
};

const ClipPathGenerator: React.FC = () => {
  // State for different shape types
  const [shapeType, setShapeType] = useState<ShapeType>("ellipse");
  
  // Ellipse/Circle parameters
  const [xRadius, setXRadius] = useState(50);
  const [yRadius, setYRadius] = useState(50);
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(50);
  
  // Polygon parameters (simplified triangle to start)
  const [polygonPoints, setPolygonPoints] = useState([
    { x: 50, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ]);
  
  // Inset parameters
  const [top, setTop] = useState(10);
  const [right, setRight] = useState(10);
  const [bottom, setBottom] = useState(10);
  const [left, setLeft] = useState(10);
  const [borderRadius, setBorderRadius] = useState(0);
  
  // Color state
  const [bgColor, setBgColor] = useState("hsl(var(--primary))");
  
  // Copy state
  const [copied, setCopied] = useState(false);
  
  // Code string
  const [clipPathCode, setClipPathCode] = useState("");
  
  // Preview area ref for getting dimensions
  const previewRef = useRef<HTMLDivElement>(null);
  
  // For demo purposes - randomize colors
  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--destructive))",
    "hsl(217 91% 60%)",
    "hsl(330 100% 60%)",
    "hsl(250 100% 60%)",
    "hsl(160 100% 40%)"
  ];
  
  const randomizeColor = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBgColor(randomColor);
  };
  
  // Reset to defaults
  const resetControls = () => {
    if (shapeType === "ellipse") {
      setXRadius(50);
      setYRadius(50);
      setXPos(50);
      setYPos(50);
    } else if (shapeType === "circle") {
      setXRadius(50);
      setXPos(50);
      setYPos(50);
    } else if (shapeType === "inset") {
      setTop(10);
      setRight(10);
      setBottom(10);
      setLeft(10);
      setBorderRadius(0);
    } else if (shapeType === "polygon") {
      setPolygonPoints([
        { x: 50, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ]);
    }
    
    toast("Reset to default shape values", {
      position: "bottom-center",
      duration: 2000,
    });
  };

  // Generate clip-path string
  useEffect(() => {
    let clipPath = "";
    
    if (shapeType === "ellipse") {
      clipPath = `ellipse(${xRadius}% ${yRadius}% at ${xPos}% ${yPos}%)`;
    } else if (shapeType === "circle") {
      clipPath = `circle(${xRadius}% at ${xPos}% ${yPos}%)`;
    } else if (shapeType === "inset") {
      clipPath = `inset(${top}% ${right}% ${bottom}% ${left}%${borderRadius > 0 ? ` round ${borderRadius}px` : ''})`;
    } else if (shapeType === "polygon") {
      const pointsString = polygonPoints
        .map((point) => `${point.x}% ${point.y}%`)
        .join(", ");
      clipPath = `polygon(${pointsString})`;
    }
    
    setClipPathCode(clipPath);
  }, [shapeType, xRadius, yRadius, xPos, yPos, top, right, bottom, left, borderRadius, polygonPoints]);

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`clip-path: ${clipPathCode};`);
    setCopied(true);
    
    toast("Copied to clipboard!", {
      position: "bottom-center",
      duration: 2000,
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-medium tracking-tight mb-2 animate-fade-in">Clip Path Generator</h1>
        <p className="text-muted-foreground max-w-md mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          Create and customize CSS clip-path shapes with an intuitive visual editor
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Preview Area */}
        <div className="md:col-span-7 glass-panel p-6 flex flex-col">
          <h2 className="text-lg font-medium mb-4 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>Preview</h2>
          
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 rounded-xl relative">
            <div 
              ref={previewRef}
              className="w-full aspect-square max-w-xs relative group animate-float"
              style={{ 
                backgroundColor: bgColor,
                clipPath: clipPathCode 
              }}
            >
              <div className="preview-mask"></div>
            </div>
          </div>
          
          <div className="mt-6 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm overflow-x-auto">
              <code>clip-path: {clipPathCode};</code>
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="inline-flex items-center justify-center text-sm py-2 px-4 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                onClick={randomizeColor}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Change Color
              </button>
              
              <button 
                className="copy-button"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy CSS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="md:col-span-5 glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>Controls</h2>
            
            <button 
              onClick={resetControls}
              className="text-xs flex items-center text-muted-foreground hover:text-foreground transition-colors opacity-0 animate-slide-up"
              style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Reset
            </button>
          </div>
          
          {/* Shape Type Selection */}
          <div className="grid grid-cols-4 gap-2 mb-6 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards', animationDelay: '0.15s' }}>
            {(["ellipse", "circle", "inset", "polygon"] as ShapeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setShapeType(type)}
                className={`py-2 px-1 text-xs capitalize rounded-lg transition-all ${
                  shapeType === type
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          {/* Dynamic Controls based on shape type */}
          <div>
            {shapeType === "ellipse" && (
              <>
                <Control 
                  label="X Radius" 
                  value={xRadius} 
                  min={0} 
                  max={100} 
                  onChange={setXRadius} 
                />
                <Control 
                  label="Y Radius" 
                  value={yRadius} 
                  min={0} 
                  max={100} 
                  onChange={setYRadius} 
                />
                <Control 
                  label="Center X" 
                  value={xPos} 
                  min={0} 
                  max={100} 
                  onChange={setXPos} 
                />
                <Control 
                  label="Center Y" 
                  value={yPos} 
                  min={0} 
                  max={100} 
                  onChange={setYPos} 
                />
              </>
            )}
            
            {shapeType === "circle" && (
              <>
                <Control 
                  label="Radius" 
                  value={xRadius} 
                  min={0} 
                  max={100} 
                  onChange={setXRadius} 
                />
                <Control 
                  label="Center X" 
                  value={xPos} 
                  min={0} 
                  max={100} 
                  onChange={setXPos} 
                />
                <Control 
                  label="Center Y" 
                  value={yPos} 
                  min={0} 
                  max={100} 
                  onChange={setYPos} 
                />
              </>
            )}
            
            {shapeType === "inset" && (
              <>
                <Control 
                  label="Top" 
                  value={top} 
                  min={0} 
                  max={100} 
                  onChange={setTop} 
                />
                <Control 
                  label="Right" 
                  value={right} 
                  min={0} 
                  max={100} 
                  onChange={setRight} 
                />
                <Control 
                  label="Bottom" 
                  value={bottom} 
                  min={0} 
                  max={100} 
                  onChange={setBottom} 
                />
                <Control 
                  label="Left" 
                  value={left} 
                  min={0} 
                  max={100} 
                  onChange={setLeft} 
                />
                <Control 
                  label="Border Radius" 
                  value={borderRadius} 
                  min={0} 
                  max={50} 
                  unit="px" 
                  onChange={setBorderRadius} 
                />
              </>
            )}
            
            {shapeType === "polygon" && (
              <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
                <p className="text-sm text-muted-foreground mb-4">
                  Simplified polygon with 3 points. Each point can be adjusted with its X/Y coordinates.
                </p>
                
                {polygonPoints.map((point, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-sm mb-2">Point {index + 1}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="control-label">
                          <span>X</span>
                          <span className="text-primary font-medium">{point.x}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={point.x}
                          onChange={(e) => {
                            const newPoints = [...polygonPoints];
                            newPoints[index].x = Number(e.target.value);
                            setPolygonPoints(newPoints);
                          }}
                          className="w-full track-appearance"
                        />
                      </div>
                      <div>
                        <div className="control-label">
                          <span>Y</span>
                          <span className="text-primary font-medium">{point.y}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={point.y}
                          onChange={(e) => {
                            const newPoints = [...polygonPoints];
                            newPoints[index].y = Number(e.target.value);
                            setPolygonPoints(newPoints);
                          }}
                          className="w-full track-appearance"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipPathGenerator;
