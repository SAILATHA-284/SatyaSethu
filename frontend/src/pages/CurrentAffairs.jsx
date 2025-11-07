import React, { useEffect, useState } from "react";
import { getTopNews } from "../api/api";

export default function CurrentAffairs() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await getTopNews();
        const articles = response.data?.articles || response.data || [];
        setNews(articles);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const containerStyle = {
    maxWidth: 900,
    margin: "30px auto",
    padding: "0 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f7fa",
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: 30,
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#78490fff",
  };

  const loadingStyle = {
    textAlign: "center",
    color: "#777",
    fontSize: "1.1rem",
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  };

  const cardHoverStyle = {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
  };

  const titleLinkStyle = {
    textDecoration: "none",
    color: "inherit",
  };

  const titleStyle = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#e22b2bff",
  fontFamily: "'Poppins', sans-serif", // changed font style
};


  const descriptionStyle = {
    marginTop: 10,
    color: "#555",
    lineHeight: 1.5,
    fontSize: "0.95rem",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>LATEST NEWS</h2>
      {loading ? (
        <p style={loadingStyle}>Loading...</p>
      ) : news.length ? (
        news.map((article, index) => (
          <div
            key={index}
            style={cardStyle}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, cardHoverStyle)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, {
                transform: "none",
                boxShadow: cardStyle.boxShadow,
              })
            }
          >
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              style={titleLinkStyle}
            >
              <h4 style={titleStyle}>{article.title}</h4>
            </a>
            <p style={descriptionStyle}>
              {article.description || article.text || "Read more..."}
            </p>
          </div>
        ))
      ) : (
        <p style={loadingStyle}>No news available.</p>
      )}
    </div>
  );
}
