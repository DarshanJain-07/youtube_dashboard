import React, { useState, useEffect } from 'react';
import { getFormattedVideoComments } from '../services/youtubeApi';

interface CommentThreadsProps {
  videoId: string;
  maxResults?: number;
  order?: 'time' | 'relevance';
}

const CommentThreads: React.FC<CommentThreadsProps> = ({ 
  videoId, 
  maxResults = 100, 
  order = 'relevance' 
}) => {
  const [comments, setComments] = useState<{
    id: string;
    authorName: string;
    text: string;
    likeCount: number;
    publishedAt: string;
    replyCount: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await getFormattedVideoComments(videoId, maxResults, order);
        setComments(data.comments);
      } catch (err) {
        setError('Failed to fetch video comments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [videoId, maxResults, order]);

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="comment-threads">
      <h2>Video Comments</h2>
      {comments.length === 0 ? (
        <p>No comments found</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <h3>{comment.authorName}</h3>
                <p className="comment-date">
                  {new Date(comment.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <div 
                className="comment-text" 
                dangerouslySetInnerHTML={{ __html: comment.text }}
              />
              <div className="comment-footer">
                <span>Likes: {comment.likeCount}</span>
                <span>Replies: {comment.replyCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThreads;