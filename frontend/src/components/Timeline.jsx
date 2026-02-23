import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import EventModal from "./EventModal";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
);

export default function Timeline({ events }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const chartRef = useRef(null);

  const visibleEvents = events.slice(currentIndex, currentIndex + visibleCount);
  const years = visibleEvents.map((e) => new Date(e.date).getFullYear());

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else {
        setVisibleCount(3);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function handleNext() {
    if (currentIndex < events.length - visibleCount) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  const chartData = {
    labels: years,
    datasets: [
      {
        data: years.map(() => 0),
        borderColor: "#000000",
        borderWidth: 2,
        pointRadius: 8,
        pointBackgroundColor: "#000000",
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
      y: {
        display: false,
        min: -1,
        max: 1,
      },
    },
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-cards">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="timeline-card"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="timeline-card-image">
              {event.image ? <img src={event.image} alt={event.title} /> : null}
            </div>
            <p className="timeline-card-title">{event.title}</p>
          </div>
        ))}
      </div>
      <div className="timeline-axis">
        <button
          className="timeline-nav-btn"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ←
        </button>
        <div className="timeline-chart" style={{ height: "80px" }}>
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
        <button
          className="timeline-nav-btn"
          onClick={handleNext}
          disabled={currentIndex >= events.length - visibleCount}
        >
          →
        </button>
      </div>
      <div className="timeline-years">
        {visibleEvents.map((event) => (
          <div key={event.id} className="timeline-year">
            {new Date(event.date).getFullYear()}
          </div>
        ))}
      </div>
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
