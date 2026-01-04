import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { Icon } from './Icon';

interface ProgrammingVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

type AlgorithmType = 'bubble-sort' | 'quick-sort' | 'merge-sort' | 'binary-search' | 'bfs' | 'dfs';
type DataStructureType = 'array' | 'linked-list' | 'binary-tree' | 'graph' | 'stack' | 'queue';

interface ArrayState {
  values: number[];
  comparing: number[];
  sorted: number[];
  pivot?: number;
}

const ProgrammingVisualizer: React.FC<ProgrammingVisualizerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'algorithms' | 'data-structures'>('algorithms');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bubble-sort');
  const [dataStructure, setDataStructure] = useState<DataStructureType>('array');
  const [arrayData, setArrayData] = useState<ArrayState>({
    values: [64, 34, 25, 12, 22, 11, 90, 5],
    comparing: [],
    sorted: []
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [stepIndex, setStepIndex] = useState(0);
  const [animationSteps, setAnimationSteps] = useState<any[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random array
  const generateRandomArray = (size: number = 8) => {
    const newArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    setArrayData({
      values: newArray,
      comparing: [],
      sorted: []
    });
    setStepIndex(0);
    setAnimationSteps([]);
  };

  // Bubble Sort Algorithm
  const generateBubbleSortSteps = (arr: number[]) => {
    const steps: ArrayState[] = [];
    const array = [...arr];
    
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = 0; j < array.length - i - 1; j++) {
        steps.push({
          values: [...array],
          comparing: [j, j + 1],
          sorted: []
        });
        
        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          steps.push({
            values: [...array],
            comparing: [j, j + 1],
            sorted: []
          });
        }
      }
      steps.push({
        values: [...array],
        comparing: [],
        sorted: Array.from({ length: array.length - i - 1 }, (_, idx) => array.length - 1 - idx)
      });
    }
    
    steps.push({
      values: [...array],
      comparing: [],
      sorted: array.map((_, idx) => idx)
    });
    
    return steps;
  };

  // Quick Sort Algorithm
  const generateQuickSortSteps = (arr: number[]) => {
    const steps: ArrayState[] = [];
    const array = [...arr];
    
    const quickSort = (arr: number[], low: number, high: number) => {
      if (low < high) {
        const pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
      }
    };
    
    const partition = (arr: number[], low: number, high: number): number => {
      const pivot = arr[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        steps.push({
          values: [...arr],
          comparing: [j, high],
          sorted: [],
          pivot: high
        });
        
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            values: [...arr],
            comparing: [i, j],
            sorted: [],
            pivot: high
          });
        }
      }
      
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      steps.push({
        values: [...arr],
        comparing: [],
        sorted: [i + 1],
        pivot: i + 1
      });
      
      return i + 1;
    };
    
    quickSort(array, 0, array.length - 1);
    
    steps.push({
      values: [...array],
      comparing: [],
      sorted: array.map((_, idx) => idx)
    });
    
    return steps;
  };

  // Merge Sort Algorithm
  const generateMergeSortSteps = (arr: number[]) => {
    const steps: ArrayState[] = [];
    const array = [...arr];
    
    const merge = (arr: number[], left: number, mid: number, right: number) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length) {
        steps.push({
          values: [...arr],
          comparing: [left + i, mid + 1 + j],
          sorted: []
        });
        
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        k++;
        steps.push({
          values: [...arr],
          comparing: [],
          sorted: []
        });
      }
      
      while (i < leftArr.length) {
        arr[k] = leftArr[i];
        i++;
        k++;
      }
      
      while (j < rightArr.length) {
        arr[k] = rightArr[j];
        j++;
        k++;
      }
    };
    
    const mergeSort = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
      }
    };
    
    mergeSort(array, 0, array.length - 1);
    
    steps.push({
      values: [...array],
      comparing: [],
      sorted: array.map((_, idx) => idx)
    });
    
    return steps;
  };

  // Binary Search
  const generateBinarySearchSteps = (arr: number[], target: number) => {
    const sortedArray = [...arr].sort((a, b) => a - b);
    const steps: ArrayState[] = [];
    let left = 0;
    let right = sortedArray.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      steps.push({
        values: [...sortedArray],
        comparing: [mid],
        sorted: []
      });
      
      if (sortedArray[mid] === target) {
        steps.push({
          values: [...sortedArray],
          comparing: [],
          sorted: [mid]
        });
        break;
      } else if (sortedArray[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return { steps, sortedArray };
  };

  const startAnimation = () => {
    if (isAnimating) {
      stopAnimation();
      return;
    }

    let steps: ArrayState[] = [];
    
    if (algorithm === 'bubble-sort') {
      steps = generateBubbleSortSteps(arrayData.values);
    } else if (algorithm === 'quick-sort') {
      steps = generateQuickSortSteps(arrayData.values);
    } else if (algorithm === 'merge-sort') {
      steps = generateMergeSortSteps(arrayData.values);
    } else if (algorithm === 'binary-search') {
      const target = arrayData.values[Math.floor(arrayData.values.length / 2)];
      const result = generateBinarySearchSteps(arrayData.values, target);
      steps = result.steps;
      setArrayData(prev => ({ ...prev, values: result.sortedArray }));
    }
    
    setAnimationSteps(steps);
    setIsAnimating(true);
    setStepIndex(0);
    
    let currentStep = 0;
    animationRef.current = setInterval(() => {
      if (currentStep < steps.length) {
        setArrayData(steps[currentStep]);
        setStepIndex(currentStep);
        currentStep++;
      } else {
        stopAnimation();
      }
    }, speed);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    setArrayData({
      values: [64, 34, 25, 12, 22, 11, 90, 5],
      comparing: [],
      sorted: []
    });
    setStepIndex(0);
    setAnimationSteps([]);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const renderArrayVisualization = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {arrayData.values.map((value, index) => {
            const isComparing = arrayData.comparing.includes(index);
            const isSorted = arrayData.sorted.includes(index);
            const isPivot = arrayData.pivot === index;
            
            return (
              <div
                key={index}
                className={`
                  w-16 h-16 flex items-center justify-center rounded-lg font-bold text-lg
                  transition-all duration-300 transform
                  ${isPivot ? 'bg-purple-500 scale-110 shadow-lg' : ''}
                  ${isComparing ? 'bg-yellow-500 scale-110 shadow-lg' : ''}
                  ${isSorted ? 'bg-green-500' : 'bg-blue-500'}
                  ${!isComparing && !isSorted && !isPivot ? 'bg-blue-500' : ''}
                `}
                style={{
                  height: `${value * 3}px`,
                  minHeight: '60px'
                }}
              >
                {value}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={startAnimation}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isAnimating
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isAnimating ? '⏸ Pause' : '▶ Start'}
          </button>
          <button
            onClick={resetAnimation}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            ↺ Reset
          </button>
          <button
            onClick={() => generateRandomArray()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            🎲 Random
          </button>
        </div>
        
        <div className="flex items-center gap-4 justify-center">
          <label className="text-sm">Speed:</label>
          <input
            type="range"
            min="100"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-48"
            disabled={isAnimating}
          />
          <span className="text-sm">{1000 - speed}ms</span>
        </div>
        
        {animationSteps.length > 0 && (
          <div className="text-center text-sm text-gray-400">
            Step {stepIndex + 1} of {animationSteps.length}
          </div>
        )}
      </div>
    );
  };

  const renderDataStructure = () => {
    if (dataStructure === 'linked-list') {
      const nodes = [1, 2, 3, 4, 5];
      return (
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {nodes.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
                {val}
              </div>
              {idx < nodes.length - 1 && (
                <div className="w-8 h-1 bg-gray-400 relative">
                  <div className="absolute right-0 top-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-gray-400 transform -translate-y-1/2"></div>
                </div>
              )}
            </div>
          ))}
          <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center font-bold">
            null
          </div>
        </div>
      );
    }
    
    if (dataStructure === 'binary-tree') {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
              1
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  2
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center font-bold mx-auto mb-2">
                  3
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm">
                    6
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm">
                    7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (dataStructure === 'graph') {
      const nodes = ['A', 'B', 'C', 'D', 'E'];
      const edges = [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
        { from: 3, to: 4 }
      ];
      
      const positions = [
        { x: 200, y: 50 },
        { x: 100, y: 150 },
        { x: 300, y: 150 },
        { x: 100, y: 250 },
        { x: 300, y: 250 }
      ];
      
      return (
        <div className="relative w-full h-96">
          <svg className="w-full h-full">
            {edges.map((edge, idx) => {
              const from = positions[edge.from];
              const to = positions[edge.to];
              return (
                <line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
              );
            })}
            {nodes.map((node, idx) => {
              const pos = positions[idx];
              return (
                <g key={idx}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="25"
                    fill="#3b82f6"
                    className="hover:fill-blue-400 transition-colors"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontWeight="bold"
                    fontSize="16"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }
    
    if (dataStructure === 'stack') {
      const stack = [1, 2, 3, 4, 5];
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="text-sm text-gray-400 mb-2">Top →</div>
          <div className="flex flex-col-reverse gap-2">
            {stack.map((val, idx) => (
              <div
                key={idx}
                className="w-32 h-16 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-blue-400"
              >
                {val}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-400 mt-2">← Bottom</div>
        </div>
      );
    }
    
    if (dataStructure === 'queue') {
      const queue = [1, 2, 3, 4, 5];
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">Front →</div>
            <div className="flex gap-2">
              {queue.map((val, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-green-400"
                >
                  {val}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-400">← Rear</div>
          </div>
        </div>
      );
    }
    
    return renderArrayVisualization();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Programming Visualizer">
      <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('algorithms')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'algorithms'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Algorithms
          </button>
          <button
            onClick={() => setActiveTab('data-structures')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'data-structures'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Data Structures
          </button>
        </div>

        {/* Algorithm Selection */}
        {activeTab === 'algorithms' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {(['bubble-sort', 'quick-sort', 'merge-sort', 'binary-search'] as AlgorithmType[]).map((alg) => (
                <button
                  key={alg}
                  onClick={() => {
                    setAlgorithm(alg);
                    resetAnimation();
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    algorithm === alg
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {alg.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              {renderArrayVisualization()}
            </div>

            {/* Algorithm Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">
                {algorithm.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Algorithm
              </h3>
              <p className="text-gray-300 text-sm">
                {algorithm === 'bubble-sort' && 
                  'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Time Complexity: O(n²)'}
                {algorithm === 'quick-sort' && 
                  'Quick Sort picks a pivot element and partitions the array around it. Time Complexity: O(n log n) average, O(n²) worst case.'}
                {algorithm === 'merge-sort' && 
                  'Merge Sort divides the array into halves, sorts them recursively, and merges them back. Time Complexity: O(n log n) in all cases.'}
                {algorithm === 'binary-search' && 
                  'Binary Search finds the position of a target value within a sorted array by repeatedly dividing the search interval in half. Time Complexity: O(log n)'}
              </p>
            </div>
          </div>
        )}

        {/* Data Structure Selection */}
        {activeTab === 'data-structures' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {(['array', 'linked-list', 'binary-tree', 'graph', 'stack', 'queue'] as DataStructureType[]).map((ds) => (
                <button
                  key={ds}
                  onClick={() => setDataStructure(ds)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    dataStructure === ds
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {ds.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
              {renderDataStructure()}
            </div>

            {/* Data Structure Info */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">
                {dataStructure.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Data Structure
              </h3>
              <p className="text-gray-300 text-sm">
                {dataStructure === 'array' && 
                  'An array is a collection of elements stored in contiguous memory locations, accessible by index.'}
                {dataStructure === 'linked-list' && 
                  'A linked list is a linear data structure where elements are linked using pointers. Each node contains data and a reference to the next node.'}
                {dataStructure === 'binary-tree' && 
                  'A binary tree is a tree data structure where each node has at most two children, referred to as left and right child.'}
                {dataStructure === 'graph' && 
                  'A graph is a collection of nodes (vertices) connected by edges, representing relationships between objects.'}
                {dataStructure === 'stack' && 
                  'A stack is a LIFO (Last In First Out) data structure where elements are added and removed from the top.'}
                {dataStructure === 'queue' && 
                  'A queue is a FIFO (First In First Out) data structure where elements are added at the rear and removed from the front.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProgrammingVisualizer;

