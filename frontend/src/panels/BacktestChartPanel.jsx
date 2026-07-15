import { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

// Generate some realistic-looking mock data for the backtest
function generateMockData() {
  const data = [];
  const volumeData = [];
  let currentPrice = 150;
  
  // Generate ~100 data points
  for (let i = 100; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Random walk with slight upward drift
    const open = currentPrice + (Math.random() - 0.5) * 2;
    const high = open + Math.random() * 3;
    const low = open - Math.random() * 3;
    const close = low + Math.random() * (high - low);
    
    data.push({ time: dateStr, open, high, low, close });
    
    // Random volume, color based on daily move
    const volume = Math.round(Math.random() * 10000 + 5000);
    const isUp = close >= open;
    volumeData.push({
      time: dateStr,
      value: volume,
      color: isUp ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)'
    });
    
    currentPrice = close;
  }
  return { candlesticks: data, volume: volumeData };
}

export default function BacktestChartPanel({ run }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: 'rgba(226, 232, 240, 0.6)', // var(--color-muted)
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(45, 49, 66, 0.4)' },
        horzLines: { color: 'rgba(45, 49, 66, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(34, 211, 238, 0.5)',
          style: 3, // dashed
        },
        horzLine: {
          width: 1,
          color: 'rgba(34, 211, 238, 0.5)',
          style: 3,
        },
      },
      timeScale: {
        borderColor: 'rgba(45, 49, 66, 0.8)',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(45, 49, 66, 0.8)',
        autoScale: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Add main candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#34d399',      // var(--color-green)
      downColor: '#f87171',    // var(--color-red)
      borderVisible: false,
      wickUpColor: '#34d399',
      wickDownColor: '#f87171',
    });

    // Add volume histogram
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Feed mock data
    const mock = generateMockData();
    candlestickSeries.setData(mock.candlesticks);
    volumeSeries.setData(mock.volume);

    // Fit content
    chart.timeScale().fitContent();

    // Responsive resizing via ResizeObserver
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const newRect = entries[0].contentRect;
      if (newRect.width === 0 || newRect.height === 0) return;
      chart.applyOptions({ width: newRect.width, height: newRect.height });
    });
    
    resizeObserverRef.current.observe(chartContainerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      chart.remove();
    };
  }, []);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <span className="drag-icon">⠿</span>
        <span className="panel-icon">📈</span>
        Backtest Chart
        <span style={{
          marginLeft: 'auto',
          fontSize: 9,
          color: 'var(--color-dim)',
          fontFamily: 'var(--font-mono)',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ width: 6, height: 6, background: 'var(--color-accent)', borderRadius: '50%', display: 'inline-block', opacity: 0.8, boxShadow: '0 0 6px var(--color-accent)' }} />
          TradingView Lightweight Charts
        </span>
      </div>
      <div 
        className="panel-body" 
        style={{ 
          padding: 0, // Remove padding so chart hits the edges
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          ref={chartContainerRef} 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
        />
      </div>
    </div>
  );
}
