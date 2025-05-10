import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const audioRef = useRef(null);

  const searchMusic = async () => {
    const res = await axios.get("https://itunes.apple.com/search", {
      params: { term: query, media: "music", limit: 20 },
    });
    setTracks(res.data.results);
    if (window.innerWidth <= 768) {
      setShowResults(true);
    }
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setProgress(0);
    setTimeout(() => {
      if (audioRef.current) audioRef.current.play();
    }, 100);
    if (window.innerWidth <= 768) {
      setShowResults(false);
    }
  };

  const formatTime = (s) => {
    if (isNaN(s)) return "00:00";
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleNext = useCallback(() => {
    if (!currentTrack) return;
    const idx = tracks.findIndex((t) => t.trackId === currentTrack.trackId);
    if (idx < tracks.length - 1) {
      playTrack(tracks[idx + 1]);
    }
  }, [currentTrack, tracks]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      loop ? audio.play() : handleNext();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, loop, handleNext]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="app">
      <header>
        <h1>🎵 Music Player</h1>
        <div className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="음악 제목 검색..."
          />
          <div className="search-buttons">
            <button onClick={searchMusic}>Search</button>
            <button
              className="mobile-toggle-btn"
              onClick={() => setShowResults((prev) => !prev)}
            >
              {showResults ? "검색결과 숨기기" : "검색결과 보기"}
            </button>
          </div>
        </div>
      </header>

      <main className="layout">
        <section
          className={`search-results ${showResults ? "" : "hide-mobile"}`}
        >
          <h2>검색 결과</h2>
          <ul>
            {tracks.map((track) => (
              <li key={track.trackId}>
                <span>{track.trackName}</span>
                <button onClick={() => playTrack(track)}>▶</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="player-center">
          {currentTrack && (
            <>
              <div className="vinyl-wrapper">
                <div className="vinyl">
                  <img
                    src={currentTrack.artworkUrl100}
                    alt="cover"
                    className="cover"
                  />
                </div>
              </div>
              <audio
                ref={audioRef}
                src={currentTrack.previewUrl}
                controls
                autoPlay
              />
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                />
              </div>
              <div className="time-info">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="controls">
                <button onClick={() => setLoop(!loop)}>
                  {loop ? "반복" : "반복X"}
                </button>
                <button onClick={handleNext}>다음곡 ⏭</button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}
        </section>

        <section className="track-info">
          <h2>ℹ️ Track Info</h2>
          {currentTrack ? (
            <div className="info-box">
              <p>
                <strong>제목:</strong> {currentTrack.trackName}
              </p>
              <p>
                <strong>작곡가:</strong> {currentTrack.artistName}
              </p>
              <p>
                <strong>장르:</strong> {currentTrack.primaryGenreName}
              </p>
            </div>
          ) : (
            <p>노래를 선택하면 곡 정보가 표시됩니다.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
