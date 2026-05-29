import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../context/authContext";
import { supabase } from "../supaBaseClient";
import "./RafflePage.css";

const SUPABASE_URL =
    "https://fzliiwigydluhgbuvnmr.supabase.co";

const getRaffleImageUrl = (path) => {
    if (!path) return null;

    return `${SUPABASE_URL}/storage/v1/object/public/raffle/${path}`;
};

const getRaffleStatus = (raffle) => {
    const now = new Date();

    if (now < new Date(raffle.start_date)) {
        return "upcoming";
    }

    if (now > new Date(raffle.end_date)) {
        return "closed";
    }

    return "live";
};

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const getPrizeIcon = (type) => {
    if (type === "coupon") return "🎟️";
    if (type === "free_product") return "🎁";
    if (type === "gift_card") return "💳";

    return "🏆";
};

/* ─────────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────────── */
const useCountdown = (targetDate) => {
    const calc = () => {
        const diff = new Date(targetDate) - new Date();

        if (diff <= 0) {
            return {
                d: 0,
                h: 0,
                m: 0,
                s: 0,
            };
        }

        return {
            d: Math.floor(diff / 86400000),
            h: Math.floor((diff % 86400000) / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
        };
    };

    const [time, setTime] = useState(calc);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(calc());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return time;
};

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
const RaffleCardSkeleton = () => (
    <div className="raffle-card">
        <div
            style={{
                flex: "0 0 40%",
                background: "#ebebeb",
                alignSelf: "stretch",
                minHeight: 240,
            }}
        />

        <div className="raffle-card-body">
            <Skeleton
                width="60%"
                height={16}
                style={{ marginBottom: 8 }}
            />

            <Skeleton
                count={2}
                height={12}
                style={{ marginBottom: 4 }}
            />

            <div
                style={{
                    borderTop: "1px solid #e8e8e8",
                    margin: "12px 0",
                    padding: "10px 0",
                }}
            >
                <Skeleton
                    width="40%"
                    height={11}
                    style={{ marginBottom: 6 }}
                />

                <Skeleton width="100%" height={3} />
            </div>

            <Skeleton
                height={40}
                style={{
                    borderRadius: 12,
                    marginTop: "auto",
                }}
            />
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   UPCOMING OVERLAY
───────────────────────────────────────────── */
const UpcomingOverlay = ({ startDate }) => {
    const { d, h, m, s } = useCountdown(startDate);

    return (
        <div className="raffle-upcoming-overlay">
            <div className="raffle-upcoming-content">
                <span className="raffle-upcoming-label">
                    Opens in
                </span>

                <div className="raffle-countdown">
                    {[
                        ["d", d],
                        ["h", h],
                        ["m", m],
                        ["s", s],
                    ].map(([unit, val]) => (
                        <div
                            key={unit}
                            className="raffle-countdown-block"
                        >
                            <span className="raffle-countdown-num">
                                {String(val).padStart(2, "0")}
                            </span>

                            <span className="raffle-countdown-unit">
                                {unit}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   RAFFLE CARD
───────────────────────────────────────────── */
const RaffleCard = ({
    raffle,
    onEnter,
    hasEntered,
    ticketNumber,
    userId,
}) => {
    const [entering, setEntering] = useState(false);
    const [message, setMessage] = useState(null);

    const status = getRaffleStatus(raffle);

    const isWinner =
        raffle.winner_id &&
        String(raffle.winner_id) === String(userId);

    const hasWinner = !!raffle.winner_id;
    const isFull = raffle.total_entries >= raffle.max_entries;

    const imageUrl = getRaffleImageUrl(raffle.image_url);

    const entriesPercent = Math.min(
        Math.round((raffle.total_entries / raffle.max_entries) * 100),
        100
    );

    const handleEnter = async () => {
        if (!userId) {
            setMessage("Please login to enter");
            return;
        }

        setEntering(true);

        const result = await onEnter(raffle.id, userId);

        setMessage(
            result?.success
                ? `You're in! Ticket: ${result.ticketNumber}`
                : result?.error || "Something went wrong"
        );

        setEntering(false);
    };

    return (
        <div className="raffle-card raffle-card-modern">

            {/* IMAGE */}
            <div
                className="raffle-card-image"
                style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : "none" }}
            >
                <div className="raffle-card-overlay" />

                {/* STATUS */}
                <div className={`raffle-status-badge raffle-status-${status}`}>
                    {status === "live"
                        ? "Live"
                        : status === "upcoming"
                            ? "Soon"
                            : "Ended"}
                </div>

                {/* WINNER BADGE */}
                {isWinner && (
                    <div className="raffle-winner-badge">🏆 You Won</div>
                )}

                {/* PRIZE */}
                <div className="raffle-prize-tag">
                    <span>{getPrizeIcon(raffle.prize_type)}</span>
                    <span className="raffle-prize-value">
                        {raffle.prize_value}
                    </span>
                </div>
            </div>

            {/* BODY */}
            <div className="raffle-card-body">

                <h3 className="raffle-title">{raffle.title}</h3>

                <p className="raffle-description">{raffle.description}</p>

                {/* META */}
                <div className="raffle-meta">
                    <div>
                        <div className="raffle-label">
                            {status === "upcoming"
                                ? "Starts"
                                : status === "live"
                                    ? "Ends"
                                    : "Ended"}
                        </div>

                        <div className="raffle-value">
                            {status === "upcoming"
                                ? formatDate(raffle.start_date)
                                : formatDate(raffle.end_date)}
                        </div>
                    </div>

                    <div className="raffle-progress">
                        <div className="raffle-value">
                            {raffle.total_entries} / {raffle.max_entries}
                        </div>

                        <div className="raffle-progress-bar">
                            <div
                                className="raffle-progress-fill"
                                style={{ width: `${entriesPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* MESSAGE */}
                {message && (
                    <div
                        className={`raffle-message ${message.includes("in!") ? "raffle-message-success" : "raffle-message-error"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* =========================
            🔥 CLEAN PRIORITY LOGIC
        ========================== */}

                {/* USER IS WINNER */}
                {isWinner ? (
                    <div className="raffle-ticket raffle-ticket--winner">
                        <span>🏆 You Won!</span>
                        <span className="raffle-ticket-number">Winner</span>
                    </div>

                ) : hasWinner ? (
                    /* SOMEONE ELSE WON (HIGHEST PRIORITY AFTER YOU WIN) */
                    <button
                        className="raffle-enter-btn raffle-btn-disabled"
                        disabled
                    >
                        Winner Already Selected
                    </button>

                ) : hasEntered ? (
                    /* USER ENTERED */
                    <div className="raffle-ticket raffle-ticket--entered">
                        <span>🎟️ Your ticket</span>
                        <span className="raffle-ticket-number">{ticketNumber}</span>
                    </div>

                ) : status === "closed" ? (
                    /* CLOSED */
                    <button className="raffle-enter-btn raffle-btn-disabled" disabled>
                        Raffle Closed
                    </button>

                ) : status === "upcoming" ? (
                    /* UPCOMING */
                    <button className="raffle-enter-btn raffle-btn-disabled" disabled>
                        Not Open Yet
                    </button>

                ) : isFull ? (
                    /* FULL */
                    <button className="raffle-enter-btn raffle-btn-disabled" disabled>
                        Raffle Full
                    </button>

                ) : (
                    /* LIVE */
                    <button
                        className="raffle-enter-btn"
                        onClick={handleEnter}
                        disabled={entering}
                    >
                        {entering ? "Entering..." : "Enter Raffle"}
                    </button>
                )}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const RafflePage = () => {
    const [raffles, setRaffles] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const [filter, setFilter] =
        useState("all");

    const [enteredMap, setEnteredMap] =
        useState({});

    const { user } = useAuth();

    const userId = user?.id || null;

    /* FETCH */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            setError(null);

            try {
                /* RAFFLES */
                const {
                    data: rafflesData,
                    error: rafflesError,
                } = await supabase
                    .from("raffles")
                    .select("*")
                    .order("start_date", {
                        ascending: true,
                    });

                if (rafflesError)
                    throw rafflesError;

                setRaffles(rafflesData || []);

                /* USER ENTRIES */
                if (userId) {
                    const {
                        data: entriesData,
                        error: entriesError,
                    } = await supabase
                        .from("raffle_entries")
                        .select(
                            "raffle_id, ticket_number"
                        )
                        .eq("user_id", userId);

                    if (entriesError)
                        throw entriesError;

                    const map = {};

                    entriesData.forEach((entry) => {
                        map[entry.raffle_id] =
                            entry.ticket_number;
                    });

                    setEnteredMap(map);
                } else {
                    setEnteredMap({});
                }
            } catch (err) {
                console.error(err);

                setError(
                    "Failed to load raffles"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    /* ENTER */
    const handleEnterRaffle = async (
        raffleId,
        uid
    ) => {
        try {
            const raffle = raffles.find(
                (r) => r.id === raffleId
            );

            if (!raffle) {
                return {
                    error: "Raffle not found",
                };
            }

            const status =
                getRaffleStatus(raffle);

            const isFull =
                raffle.total_entries >=
                raffle.max_entries;

            /* WINNER ALREADY SELECTED */
            if (raffle.winner_id) {
                return {
                    error:
                        "Winner already selected",
                };
            }

            /* UPCOMING */
            if (status === "upcoming") {
                return {
                    error:
                        "Raffle has not started yet",
                };
            }

            /* CLOSED */
            if (status === "closed") {
                return {
                    error:
                        "Raffle is already closed",
                };
            }

            /* ALREADY ENTERED */
            if (enteredMap[raffleId]) {
                return {
                    error:
                        "You already entered this raffle",
                };
            }

            /* FULL */
            if (isFull) {
                return {
                    error: "Raffle is full",
                };
            }

            const ticketNumber =
                "TKT-" +
                Math.random()
                    .toString(36)
                    .slice(2, 8)
                    .toUpperCase();

            /* INSERT ENTRY */
            const { error: insertError } =
                await supabase
                    .from("raffle_entries")
                    .insert({
                        raffle_id: raffleId,
                        user_id: uid,
                        ticket_number: ticketNumber,
                    });

            if (insertError) {
                console.error(insertError);

                return {
                    error:
                        "Failed to enter raffle",
                };
            }

            const newTotal =
                raffle.total_entries + 1;

            /* UPDATE TOTAL */
            const { error: updateError } =
                await supabase
                    .from("raffles")
                    .update({
                        total_entries: newTotal,
                    })
                    .eq("id", raffleId);

            if (updateError) {
                console.error(updateError);

                return {
                    error:
                        "Failed to update raffle",
                };
            }

            /* LOCAL UPDATE */
            setRaffles((prev) =>
                prev.map((r) =>
                    r.id === raffleId
                        ? {
                            ...r,
                            total_entries:
                                newTotal,
                        }
                        : r
                )
            );

            setEnteredMap((prev) => ({
                ...prev,
                [raffleId]: ticketNumber,
            }));

            return {
                success: true,
                ticketNumber,
            };
        } catch (err) {
            console.error(err);

            return {
                error: "Something went wrong",
            };
        }
    };

    const hasEntered = (id) =>
        !!enteredMap[id];

    const getTicketNum = (id) =>
        enteredMap[id];

    const filtered = raffles.filter(
        (r) =>
            filter === "all"
                ? true
                : getRaffleStatus(r) === filter
    );

    const counts = {
        all: raffles.length,

        live: raffles.filter(
            (r) =>
                getRaffleStatus(r) === "live"
        ).length,

        upcoming: raffles.filter(
            (r) =>
                getRaffleStatus(r) ===
                "upcoming"
        ).length,

        closed: raffles.filter(
            (r) =>
                getRaffleStatus(r) === "closed"
        ).length,
    };

    return (
        <div className="raffle-page">
            {/* HERO */}
            <div className="raffle-hero">
                <span className="raffle-hero-tag">
                    Limited Time
                </span>

                <h1 className="raffle-hero-title">
                    Win
                    <br />

                    <em className="hollow">
                        Big.
                    </em>
                </h1>

                <p className="raffle-hero-sub">
                    Enter for a chance to win
                    exclusive prizes, discount
                    coupons, and gift cards.
                </p>
            </div>

            {/* CONTENT */}
            <div className="raffle-container">
                {/* FILTERS */}
                <div className="raffle-filters">
                    {[
                        "all",
                        "live",
                        "upcoming",
                        "closed",
                    ].map((f) => (
                        <button
                            key={f}
                            className={`raffle-filter-btn ${filter === f
                                    ? "active"
                                    : ""
                                }`}
                            onClick={() =>
                                setFilter(f)
                            }
                        >
                            {f.charAt(0).toUpperCase() +
                                f.slice(1)}

                            <span className="raffle-filter-count">
                                {counts[f]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="raffle-grid">
                        {Array.from({
                            length: 4,
                        }).map((_, i) => {
                            const isEven =
                                i % 2 === 1;

                            return (
                                <React.Fragment
                                    key={i}
                                >
                                    {isEven && (
                                        <div className="raffle-divider">
                                            /
                                        </div>
                                    )}

                                    <RaffleCardSkeleton />
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="raffle-error">
                        {error}
                    </div>
                )}

                {/* EMPTY */}
                {!loading &&
                    !error &&
                    filtered.length === 0 && (
                        <div className="raffle-empty">
                            <span>🎟️</span>

                            <p>
                                No raffles found
                            </p>
                        </div>
                    )}

                {/* LIST */}
                {!loading &&
                    !error &&
                    filtered.length > 0 && (
                        <div className="raffle-grid">
                            {filtered.map(
                                (raffle, i) => {
                                    const isEven =
                                        i % 2 === 1;

                                    return (
                                        <React.Fragment
                                            key={raffle.id}
                                        >
                                            {isEven && (
                                                <div className="raffle-divider">
                                                    /
                                                </div>
                                            )}

                                            <RaffleCard
                                                raffle={raffle}
                                                onEnter={
                                                    handleEnterRaffle
                                                }
                                                hasEntered={hasEntered(
                                                    raffle.id
                                                )}
                                                ticketNumber={getTicketNum(
                                                    raffle.id
                                                )}
                                                userId={userId}
                                            />
                                        </React.Fragment>
                                    );
                                }
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
};

export default RafflePage;