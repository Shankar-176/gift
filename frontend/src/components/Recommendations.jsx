import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const Recommendations = () => {
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const passedRecommendations = location.state?.recommendations;

    if (passedRecommendations && passedRecommendations.length > 0) {
      const uniqueRecommendations = filterDuplicates(passedRecommendations);
      setRecommendations(uniqueRecommendations);
    } else {
      // Fallback: fetch from backend
      fetchRecommendationsFromBackend();
    }
  }, [location.state]);

  const fetchRecommendationsFromBackend = async () => {
    try {
      const response = await axios.get(
        'https://gift-recommend.onrender.com/api/recommendations',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const uniqueRecommendations = filterDuplicates(response.data);
      setRecommendations(uniqueRecommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
    }
  };

  const filterDuplicates = (recs) => {
    const seen = new Set();
    return recs.filter((rec) => {
      const key = rec.name + rec.search_url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Gift Recommendations</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {recommendations.length === 0 && !error ? (
        <p>No recommendations found. Please try a new search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recommendations.map((item, index) => (
            <div
              key={index}
              className="border p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={item.image || 'https://via.placeholder.com/150'}
                alt={item.name}
                className="w-full h-40 object-cover mb-4 rounded"
              />
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-green-700 font-bold mt-2">{item.price}</p>
              {item.search_url && (
                <a
                  href={item.search_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-500 hover:underline"
                >
                  View Product
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
