import React from 'react';
import '../../styles/components/ShortUserCard.css';

const UserCard = ({
    username,
    email,
    githubUrl,
    fullName,
}) => {
    const displayName = fullName || username || '';
    const initials = (displayName || '')
        .split(' ')
        .map((p) => p && p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <article className="user-card" aria-label={`User card for ${displayName}`}>
            <div className="user-card__avatar">
                <span>{initials}</span>
            </div>
            <div className="user-card__body">
                <div className="user-card__header">
                    <h3 className="user-card__name">{displayName}</h3>
                    {username && displayName && username !== displayName && (
                        <span className="user-card__username">@{username}</span>
                    )}
                </div>
                <ul className="user-card__meta">
                    {email && (
                        <li>
                            <a
                                className="user-card__link"
                                href={`mailto:${email}`}
                                title={`Email ${displayName}`}
                            >
                                {email}
                            </a>
                        </li>
                    )}
                    {githubUrl && (
                        <li>
                            <a
                                className="user-card__link"
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Open ${displayName}'s GitHub`}
                            >
                                GitHub
                            </a>
                        </li>
                    )}
                </ul>
            </div>
        </article>
    );
};

export default UserCard;