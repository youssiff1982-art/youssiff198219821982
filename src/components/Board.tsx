import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Transformer, Group, Circle, Text, Rect, RegularPolygon, Shape } from 'react-konva';
import useImage from 'use-image';
import { useMeasure } from 'react-use';
import { Tool, LineData, ImageData, TextData, ShapeData } from '../types';
import { Lock, Unlock } from 'lucide-react';

interface BoardProps {
  lines: LineData[];
  images: ImageData[];
  texts: TextData[];
  shapes: ShapeData[];
  onDraw?: (lines: LineData[]) => void;
  onImagesUpdate?: (images: ImageData[]) => void;
  onTextsUpdate?: (texts: TextData[]) => void;
  onShapesUpdate?: (shapes: ShapeData[]) => void;
  tool: Tool;
  color: string;
  brushSize: number;
  isReadOnly?: boolean;
  showGrid?: boolean;
  gridSpacing?: number;
}

const URLImage = ({ 
  imageObj, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  imageObj: ImageData; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (newAttrs: any) => void;
}) => {
  const [img] = useImage(imageObj.url, 'anonymous');
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && !imageObj.locked) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, imageObj.locked]);

  return (
    <Group>
      <KonvaImage
        image={img}
        x={imageObj.x}
        y={imageObj.y}
        width={imageObj.width}
        height={imageObj.height}
        draggable={!imageObj.locked}
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...imageObj,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...imageObj,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {/* Red Lock Button - Lens sized circle */}
      <Group
        x={imageObj.x + imageObj.width - 15}
        y={imageObj.y + 15}
        onClick={(e) => {
          e.cancelBubble = true;
          onChange({ ...imageObj, locked: !imageObj.locked });
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onChange({ ...imageObj, locked: !imageObj.locked });
        }}
        className="cursor-pointer"
      >
        <Circle
          radius={12}
          fill={imageObj.locked ? "#ef4444" : "#ffffff"}
          stroke="#ef4444"
          strokeWidth={2}
          shadowBlur={5}
        />
        {/* Simple lock/unlock indicator */}
        <Circle radius={4} fill={imageObj.locked ? "white" : "#ef4444"} />
      </Group>

      {isSelected && !imageObj.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};

const EditableText = ({ 
  textObj, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  textObj: TextData; 
  isSelected: boolean; 
  onSelect: () => void; 
  onChange: (newAttrs: any) => void;
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        text={textObj.text}
        x={textObj.x}
        y={textObj.y}
        fontSize={textObj.fontSize}
        fill={textObj.color}
        fontFamily={textObj.fontFamily || 'Inter'}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...textObj,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          onChange({
            ...textObj,
            x: node.x(),
            y: node.y(),
            fontSize: node.fontSize() * scaleX,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export const Board = React.forwardRef<any, BoardProps>(({ 
  lines, 
  images, 
  texts,
  shapes,
  onDraw, 
  onImagesUpdate, 
  onTextsUpdate,
  onShapesUpdate,
  tool, 
  color, 
  brushSize,
  isReadOnly = false,
  showGrid = false,
  gridSpacing = 40
}, ref) => {
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();
  const [selectedId, setSelectedId] = useState<{ type: 'image' | 'text' | 'shape', id: string | number } | null>(null);
  const [textInput, setTextInput] = useState<{ x: number, y: number } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => stageRef.current);

  useEffect(() => {
    if (textInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [textInput]);

  const handleMouseDown = (e: any) => {
    if (isReadOnly) return;
    
    // Deselect if clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }

    if (tool === 'text') {
      return;
    }

    if (['pen', 'calligraphy', 'chiseled', 'gold', 'laser', 'eraser', 'ruler'].includes(tool)) {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      const newLine: LineData = {
        tool,
        color: tool === 'gold' ? '#FFD700' : (tool === 'eraser' ? '#ffffff' : color),
        points: [pos.x, pos.y],
        width: tool === 'eraser' ? brushSize * 2 : brushSize,
      };
      onDraw?.([...lines, newLine]);
    }

    if (['rect', 'circle', 'triangle'].includes(tool) && clickedOnEmpty) {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();
      const newShape: ShapeData = {
        type: tool as any,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: color,
        strokeWidth: brushSize / 2,
        id: Math.random().toString(36).substring(7),
      };
      onShapesUpdate?.([...shapes, newShape]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || isReadOnly) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (['pen', 'calligraphy', 'chiseled', 'gold', 'laser', 'eraser'].includes(tool)) {
      const lastLine = lines[lines.length - 1];
      if (!lastLine) return;
      
      const newLines = [...lines];
      newLines[newLines.length - 1] = {
        ...lastLine,
        points: lastLine.points.concat([point.x, point.y]),
      };
      onDraw?.(newLines);
    } else if (tool === 'ruler') {
      const lastLine = lines[lines.length - 1];
      if (!lastLine) return;
      const newLines = [...lines];
      // Keep only start and current point for straight line
      newLines[newLines.length - 1] = {
        ...lastLine,
        points: [lastLine.points[0], lastLine.points[1], point.x, point.y],
      };
      onDraw?.(newLines);
    } else if (['rect', 'circle', 'triangle'].includes(tool)) {
      const lastShape = shapes[shapes.length - 1];
      if (!lastShape) return;
      const newShapes = [...shapes];
      newShapes[newShapes.length - 1] = {
        ...lastShape,
        width: point.x - lastShape.x,
        height: point.y - lastShape.y,
      };
      onShapesUpdate?.(newShapes);
    }

    if (tool === 'laser') {
      setTimeout(() => {
        onDraw?.(lines.slice(0, -1));
      }, 1000);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() && textInput) {
      const textData: TextData = {
        text: inputValue,
        x: textInput.x,
        y: textInput.y,
        fontSize: 30,
        color: color,
        id: Math.random().toString(36).substring(7),
      };
      onTextsUpdate?.([...texts, textData]);
    }
    setTextInput(null);
    setInputValue('');
  };

  const handleStageInteraction = (e: any) => {
    if (tool === 'text' && !isReadOnly) {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      if (pos) {
        setTextInput({ x: pos.x, y: pos.y });
        setInputValue('');
        // Focus the input immediately for mobile keyboard
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden border border-gray-200 relative">
      <form 
        onSubmit={handleTextSubmit}
        className={`absolute z-50 transition-opacity ${textInput ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ 
          left: textInput ? textInput.x : -2000, 
          top: textInput ? textInput.y : -2000 
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => handleTextSubmit()}
          className="bg-white border-2 border-emerald-500 rounded-lg px-3 py-2 outline-none shadow-2xl font-bold text-2xl min-w-[200px]"
          dir="rtl"
          placeholder="اكتب هنا..."
        />
      </form>
      <Stage
        width={width || 800}
        height={height || 600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageInteraction}
        onTap={handleStageInteraction}
        ref={stageRef}
      >
        <Layer>
          {showGrid && width && height && Array.from({ length: Math.ceil(height / gridSpacing) }).map((_, i) => (
            <Line
              key={`grid-${i}`}
              points={[0, i * gridSpacing, width, i * gridSpacing]}
              stroke="#dbeafe"
              strokeWidth={1}
              listening={false}
            />
          ))}
          {showGrid && width && (
            <Line
              points={[width - 60, 0, width - 60, height || 600]}
              stroke="#fecaca"
              strokeWidth={2}
              listening={false}
            />
          )}
        </Layer>
        <Layer>
          {images.map((img, i) => (
            <URLImage 
              key={i} 
              imageObj={img} 
              isSelected={selectedId?.type === 'image' && selectedId.id === i}
              onSelect={() => setSelectedId({ type: 'image', id: i })}
              onChange={(newAttrs) => {
                const newImages = images.slice();
                newImages[i] = newAttrs;
                onImagesUpdate?.(newImages);
              }}
            />
          ))}
          {texts.map((txt, i) => (
            <EditableText
              key={txt.id}
              textObj={txt}
              isSelected={selectedId?.type === 'text' && selectedId.id === i}
              onSelect={() => setSelectedId({ type: 'text', id: i })}
              onChange={(newAttrs) => {
                const newTexts = texts.slice();
                newTexts[i] = newAttrs;
                onTextsUpdate?.(newTexts);
              }}
            />
          ))}
          {lines.map((line, i) => {
            if (line.tool === 'chiseled' || line.tool === 'calligraphy') {
              return (
                <Shape
                  key={i}
                  sceneFunc={(context, shape) => {
                    const points = line.points;
                    if (points.length < 2) return;
                    
                    const slant = line.width / 2;
                    context.beginPath();
                    
                    if (points.length === 2) {
                      context.moveTo(points[0] - slant, points[1] + slant);
                      context.lineTo(points[0] + slant, points[1] - slant);
                      context.strokeShape(shape);
                    } else {
                      // Draw a "ribbon" to simulate a slanted chiseled tip
                      // Top edge
                      context.moveTo(points[0] - slant, points[1] + slant);
                      for (let j = 2; j < points.length; j += 2) {
                        context.lineTo(points[j] - slant, points[j+1] + slant);
                      }
                      // Bottom edge (reverse)
                      for (let j = points.length - 2; j >= 0; j -= 2) {
                        context.lineTo(points[j] + slant, points[j+1] - slant);
                      }
                      context.closePath();
                      context.fillShape(shape);
                    }
                  }}
                  fill={line.color}
                  stroke={line.color}
                  strokeWidth={line.width / 4}
                />
              );
            }
            return (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.width}
                tension={line.tool === 'ruler' ? 0 : 0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
                shadowColor={line.tool === 'gold' ? '#B8860B' : undefined}
                shadowBlur={line.tool === 'gold' ? 5 : 0}
              />
            );
          })}
          {shapes.map((shape, i) => (
            <React.Fragment key={shape.id}>
              {shape.type === 'rect' && (
                <Rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  draggable={!isReadOnly}
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[i] = { ...shape, x: e.target.x(), y: e.target.y() };
                    onShapesUpdate?.(newShapes);
                  }}
                />
              )}
              {shape.type === 'circle' && (
                <Circle
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  radius={Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  draggable={!isReadOnly}
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[i] = { ...shape, x: e.target.x() - shape.width / 2, y: e.target.y() - shape.height / 2 };
                    onShapesUpdate?.(newShapes);
                  }}
                />
              )}
              {shape.type === 'triangle' && (
                <RegularPolygon
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  sides={3}
                  radius={Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  draggable={!isReadOnly}
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    newShapes[i] = { ...shape, x: e.target.x() - shape.width / 2, y: e.target.y() - shape.height / 2 };
                    onShapesUpdate?.(newShapes);
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
});
