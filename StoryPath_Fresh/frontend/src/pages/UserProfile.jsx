/**
 * User Profile Page
 * 
 * Displays public user profile information and their created stories.
 * Shows:
 * - User name and email
 * - Story count
 * - Member since date
 * - All stories created by user (playable)
 * 
 * Publicly accessible - no authentication required.
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

/**
 * UserProfile Component
 * Displays user profile and their story portfolio
 */
export default function UserProfile() {
  const { userId } = useParams();
  
  // ============= PROFILE STATE =============
  const [profile, setProfile] = useState(null);      // User profile info
  const [stories, setStories] = useState([]);        // User's stories
  
  // ============= UI STATE =============
  const [loading, setLoading] = useState(true);      // Loading state
  const [error, setError] = useState("");            // Error message

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const profileRes = await api.get(`/stories/users/${userId}/profile`);
        const storiesRes = await api.get(`/stories/users/${userId}/stories`);
        setProfile(profileRes.data);
        setStories(storiesRes.data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="container">
        <div className="panel animIn">
          <div className="alert ok">Loading commander profile…</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container">
        <div className="panel animIn">
          <div className="alert error">{error || "Profile not found"}</div>
            <Link className="btn btnPrimary" to="/stories">Back to Star Archive</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="panel animIn">
        <div className="panelHeader">
          <div>
            <div className="kicker">COMMANDER PROFILE</div>
            <h1 className="panelBigTitle">{profile.name}</h1>
            <p className="panelText">{profile.email}</p>
          </div>
          <Link className="btn btnGhost" to="/stories">Back to Star Archive</Link>
        </div>

        <div className="profileStats">
          <div className="stat">
            <div className="statLabel">Campaigns Created</div>
            <div className="statValue">{profile._count.stories}</div>
          </div>
          <div className="stat">
            <div className="statLabel">Member Since</div>
            <div className="statValue">
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="empty">
            <div className="emptyTitle">No campaigns yet.</div>
            <div className="muted">This commander has not published operations yet.</div>
          </div>
        ) : (
          <>
            <h2 className="subTitle">Campaigns by {profile.name}</h2>
            <div className="cards">
              {stories.map((s, idx) => (
                <div
                  key={s.id}
                  className={`storyCard animIn ${idx % 2 ? "delay1" : ""}`}
                >
                  <div className="storyTop">
                    <div>
                      <div className="storyTitle">{s.title}</div>
                      <div className="storyMeta">
                        ID #{s.id}
                      </div>
                    </div>
                    <div className="chip small">
                      <span className="chipDot" />
                      deployable
                    </div>
                  </div>
                  <div className="storyDesc">{s.description}</div>
                  <div className="storyActions">
                    <Link className="btn btnPrimary" to={`/stories/${s.id}/play`}>
                      Play
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
