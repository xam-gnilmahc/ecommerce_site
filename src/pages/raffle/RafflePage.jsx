import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../supaBaseClient';

const SUPABASE_URL = 'https://fzliiwigydluhgbuvnmr.supabase.co';

const getRaffleImageUrl = (path) => {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/raffle/${path}`;
};

const getRaffleStatus = (raffle) => {
  const now = new Date();
  if (now < new Date(raffle.start_date)) return 'upcoming';
  if (now > new Date(raffle.end_date)) return 'closed';
  return 'live';
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const getPrizeIcon = (type) => {
  if (type === 'coupon') return '🎟️';
  if (type === 'free_product') return '🎁';
  if (type === 'gift_card') return '💳';
  return '🏆';
};

const useCountdown = (targetDate) => {
  const calc = () => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const timer = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return time;
};

const RaffleCardSkeleton = () => (
  <div className="border-[1.5px] border-gray-200 rounded-xl overflow-hidden bg-white flex flex-row min-h-[240px] transition-transform duration-200 hover:-translate-y-[3px]">
    <div
      style={{
        flex: '0 0 40%',
        background: '#ebebeb',
        alignSelf: 'stretch',
        minHeight: 240,
      }}
    />
    <div className="p-[22px_24px] flex flex-col flex-1 min-w-0 overflow-hidden">
      <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton count={2} height={12} style={{ marginBottom: 4 }} />
      <div
        style={{
          borderTop: '1px solid #e8e8e8',
          margin: '12px 0',
          padding: '10px 0',
        }}
      >
        <Skeleton width="40%" height={11} style={{ marginBottom: 6 }} />
        <Skeleton width="100%" height={3} />
      </div>
      <Skeleton
        height={40}
        style={{
          borderRadius: 12,
          marginTop: 'auto',
        }}
      />
    </div>
  </div>
);

const UpcomingOverlay = ({ startDate }) => {
  const { d, h, m, s } = useCountdown(startDate);

  return (
    <div className="absolute inset-0 bg-[rgba(110,108,108,0.78)] flex items-center justify-center z-[2] backdrop-blur-[3px]">
      <div className="text-center text-white">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-60 block mb-[10px]">
          Opens in
        </span>
        <div className="flex gap-2">
          {[
            ['d', d],
            ['h', h],
            ['m', m],
            ['s', s],
          ].map(([unit, val]) => (
            <div
              key={unit}
              className="flex flex-col items-center bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] rounded-lg px-[10px] py-[6px] min-w-[44px]"
            >
              <span className="text-[22px] font-black italic leading-none">
                {String(val).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.08em] opacity-50 mt-[3px]">
                {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RaffleCard = ({ raffle, onEnter, hasEntered, ticketNumber, userId }) => {
  const [entering, setEntering] = useState(false);
  const [message, setMessage] = useState(null);

  const status = getRaffleStatus(raffle);
  const isWinner = raffle.winner_id && String(raffle.winner_id) === String(userId);
  const hasWinner = !!raffle.winner_id;
  const isFull = raffle.total_entries >= raffle.max_entries;
  const imageUrl = getRaffleImageUrl(raffle.image_url);

  const entriesPercent = Math.min(
    Math.round((raffle.total_entries / raffle.max_entries) * 100),
    100
  );

  const handleEnter = async () => {
    if (!userId) {
      setMessage('Please login to enter');
      return;
    }
    setEntering(true);
    const result = await onEnter(raffle.id, userId);
    setMessage(
      result?.success
        ? `You're in! Ticket: ${result.ticketNumber}`
        : result?.error || 'Something went wrong'
    );
    setEntering(false);
  };

  const statusBadgeClass =
    status === 'live'
      ? 'bg-[rgba(5,150,105,0.15)] border-[1.5px] border-emerald-600 text-emerald-600'
      : status === 'upcoming'
        ? 'bg-[rgba(217,119,6,0.12)] border-[1.5px] border-amber-500 text-amber-500'
        : 'bg-[rgba(107,114,128,0.12)] border-[1.5px] border-gray-400 text-gray-400';

  return (
    <div className="border-[1.5px] border-gray-200 rounded-xl overflow-hidden bg-white flex flex-row min-h-[240px] transition-transform duration-200 hover:-translate-y-[3px]">
      <div
        className="relative flex-[0_0_40%] min-w-0 self-stretch bg-gray-50 bg-center bg-cover bg-no-repeat max-sm:flex-none max-sm:w-full max-sm:h-[180px]"
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(10,10,10,0.32)] max-sm:bg-gradient-to-b max-sm:from-transparent max-sm:to-[rgba(10,10,10,0.55)]" />

        <div
          className={`absolute top-[14px] left-[14px] flex items-center gap-[5px] text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-[5px] rounded-full backdrop-blur-[8px] ${statusBadgeClass}`}
        >
          {status === 'live' ? 'Live' : status === 'upcoming' ? 'Soon' : 'Ended'}
        </div>

        {isWinner && (
          <div className="absolute top-[52px] left-[14px] z-[4] bg-[#f59e0b] text-white rounded-full py-[6px] px-3 text-[11px] font-bold uppercase tracking-[0.08em] shadow-[0_4px_14px_rgba(245,158,11,0.35)]">
            🏆 You Won
          </div>
        )}

        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gray-900 flex flex-col items-center justify-center gap-[10px] z-[3]">
          <span>{getPrizeIcon(raffle.prize_type)}</span>
          <span className="text-[11px] font-black italic text-white uppercase tracking-[0.06em] [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180 whitespace-nowrap">
            {raffle.prize_value}
          </span>
        </div>
      </div>

      <div className="p-[22px_24px] flex flex-col flex-1 min-w-0 overflow-hidden">
        <h3 className="text-base font-extrabold uppercase tracking-[0.03em] text-gray-900 mb-[6px] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis m-0">
          {raffle.title}
        </h3>

        <p className="text-[13px] text-gray-500 mb-3 leading-[1.55] flex-1 line-clamp-2 m-0">
          {raffle.description}
        </p>

        <div className="flex flex-row gap-5 py-3 border-t border-b border-gray-200 mb-[14px] items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
              {status === 'upcoming' ? 'Starts' : status === 'live' ? 'Ends' : 'Ended'}
            </div>
            <div className="text-[13px] font-extrabold text-gray-900">
              {status === 'upcoming' ? formatDate(raffle.start_date) : formatDate(raffle.end_date)}
            </div>
          </div>

          <div className="min-w-[120px]">
            <div className="text-[13px] font-extrabold text-gray-900">
              {raffle.total_entries} / {raffle.max_entries}
            </div>
            <div className="h-[3px] bg-gray-200 rounded-full mt-[6px] overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-[width] duration-400 ease-linear"
                style={{ width: `${entriesPercent}%` }}
              />
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`text-[13px] px-3 py-[7px] rounded-lg mb-[10px] font-semibold ${
              message.includes('in!')
                ? 'bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.25)] text-emerald-600'
                : 'bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.2)] text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        {isWinner ? (
          <div className="mt-auto mb-0 bg-gradient-to-br from-[rgba(255,215,0,0.12)] to-[rgba(255,180,0,0.08)] border-[1.5px] border-[rgba(255,180,0,0.4)] text-[#b45309] font-bold flex justify-between items-center bg-gray-50 border-[1.5px] border-dashed border-[rgba(255,180,0,0.4)] rounded-lg px-3 py-[7px] mb-[10px] text-[13px]">
            <span>🏆 You Won!</span>
            <span className="text-xs font-extrabold text-[#92400e] tracking-[0.06em]">Winner</span>
          </div>
        ) : hasWinner ? (
          <button
            className="flex items-center justify-center w-full h-10 mt-auto bg-gray-50 text-gray-500 border-[1.5px] border-gray-200 cursor-default rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase"
            disabled
          >
            Winner Already Selected
          </button>
        ) : hasEntered ? (
          <div className="mt-auto mb-0 bg-[rgba(5,150,105,0.06)] border-[1.5px] border-[rgba(5,150,105,0.3)] text-emerald-600 font-semibold flex justify-between items-center bg-gray-50 border-[1.5px] border-dashed border-[rgba(5,150,105,0.3)] rounded-lg px-3 py-[7px] mb-[10px] text-[13px]">
            <span>🎟️ Your ticket</span>
            <span className="text-xs font-extrabold text-gray-900 tracking-[0.06em]">
              {ticketNumber}
            </span>
          </div>
        ) : status === 'closed' ? (
          <button
            className="flex items-center justify-center w-full h-10 mt-auto bg-gray-50 text-gray-500 border-[1.5px] border-gray-200 cursor-default rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase"
            disabled
          >
            Raffle Closed
          </button>
        ) : status === 'upcoming' ? (
          <button
            className="flex items-center justify-center w-full h-10 mt-auto bg-gray-50 text-gray-500 border-[1.5px] border-gray-200 cursor-default rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase"
            disabled
          >
            Not Open Yet
          </button>
        ) : isFull ? (
          <button
            className="flex items-center justify-center w-full h-10 mt-auto bg-gray-50 text-gray-500 border-[1.5px] border-gray-200 cursor-default rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase"
            disabled
          >
            Raffle Full
          </button>
        ) : (
          <button
            className="flex items-center justify-center w-full h-10 mt-auto bg-gray-900 text-white border-none rounded-lg text-[13px] font-bold tracking-[0.05em] uppercase cursor-pointer transition-transform duration-150 hover:-translate-y-[0.5px]"
            onClick={handleEnter}
            disabled={entering}
          >
            {entering ? 'Entering...' : 'Enter Raffle'}
          </button>
        )}
      </div>
    </div>
  );
};

const RafflePage = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [enteredMap, setEnteredMap] = useState({});
  const { user } = useAuth();
  const userId = user?.id || null;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: rafflesData, error: rafflesError } = await supabase
          .from('raffles')
          .select('*')
          .order('start_date', { ascending: true });

        if (rafflesError) throw rafflesError;
        setRaffles(rafflesData || []);

        if (userId) {
          const { data: entriesData, error: entriesError } = await supabase
            .from('raffle_entries')
            .select('raffle_id, ticket_number')
            .eq('user_id', userId);

          if (entriesError) throw entriesError;
          const map = {};
          entriesData.forEach((entry) => {
            map[entry.raffle_id] = entry.ticket_number;
          });
          setEnteredMap(map);
        } else {
          setEnteredMap({});
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load raffles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleEnterRaffle = async (raffleId, uid) => {
    try {
      const raffle = raffles.find((r) => r.id === raffleId);
      if (!raffle) return { error: 'Raffle not found' };

      const status = getRaffleStatus(raffle);
      const isFull = raffle.total_entries >= raffle.max_entries;

      if (raffle.winner_id) return { error: 'Winner already selected' };
      if (status === 'upcoming') return { error: 'Raffle has not started yet' };
      if (status === 'closed') return { error: 'Raffle is already closed' };
      if (enteredMap[raffleId]) return { error: 'You already entered this raffle' };
      if (isFull) return { error: 'Raffle is full' };

      const ticketNumber = 'TKT-' + Math.random().toString(36).slice(2, 8).toUpperCase();

      const { error: insertError } = await supabase.from('raffle_entries').insert({
        raffle_id: raffleId,
        user_id: uid,
        ticket_number: ticketNumber,
      });

      if (insertError) {
        console.error(insertError);
        return { error: 'Failed to enter raffle' };
      }

      const newTotal = raffle.total_entries + 1;

      const { error: updateError } = await supabase
        .from('raffles')
        .update({ total_entries: newTotal })
        .eq('id', raffleId);

      if (updateError) {
        console.error(updateError);
        return { error: 'Failed to update raffle' };
      }

      setRaffles((prev) =>
        prev.map((r) => (r.id === raffleId ? { ...r, total_entries: newTotal } : r))
      );

      setEnteredMap((prev) => ({
        ...prev,
        [raffleId]: ticketNumber,
      }));

      return { success: true, ticketNumber };
    } catch (err) {
      console.error(err);
      return { error: 'Something went wrong' };
    }
  };

  const hasEntered = (id) => !!enteredMap[id];
  const getTicketNum = (id) => enteredMap[id];

  const filtered = raffles.filter((r) => (filter === 'all' ? true : getRaffleStatus(r) === filter));

  const counts = {
    all: raffles.length,
    live: raffles.filter((r) => getRaffleStatus(r) === 'live').length,
    upcoming: raffles.filter((r) => getRaffleStatus(r) === 'upcoming').length,
    closed: raffles.filter((r) => getRaffleStatus(r) === 'closed').length,
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <div className="border-b-[1.5px] border-gray-200 py-[30px_10px_52px] max-w-[1200px] mx-auto max-sm:py-[36px_16px_28px] max-md:py-[44px_28px_36px] max-lg:py-[52px_40px_44px]">
        <span className="inline-flex items-center gap-[6px] text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500 bg-gray-50 border-[1.5px] border-gray-200 rounded-full px-[14px] py-[5px] mb-5 before:content-[''] before:w-[6px] before:h-[6px] before:rounded-full before:bg-emerald-600 before:animate-[rf-blink_1.4s_ease-in-out_infinite]">
          Limited Time
        </span>

        <h1 className="text-[clamp(48px,6vw,80px)] font-black italic uppercase leading-[0.92] tracking-[-0.025em] text-gray-900 m-0 mb-5 max-sm:text-[44px]">
          Win
          <br />
          <em
            className="not-italic"
            style={{
              WebkitTextStroke: '2px #111827',
              color: 'transparent',
            }}
          >
            Big.
          </em>
        </h1>

        <p className="text-base text-gray-500 max-w-[520px] leading-[1.6] m-0">
          Enter for a chance to win exclusive prizes, discount coupons, and gift cards.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto py-5 px-[10px_10px_100px] max-sm:py-[28px_16px_56px] max-md:py-[36px_28px_64px] max-lg:py-[44px_40px_80px]">
        <div className="flex gap-2 mb-[44px] flex-wrap">
          {['all', 'live', 'upcoming', 'closed'].map((f) => (
            <button
              key={f}
              className={`flex items-center gap-[7px] px-5 py-[9px] border-[1.5px] border-gray-200 rounded-full bg-white text-[13px] font-bold uppercase tracking-[0.06em] text-gray-500 cursor-pointer transition-[border-color,color,background] duration-150 hover:border-gray-900 hover:text-gray-900 ${
                filter === f ? 'bg-gray-900 border-gray-900 text-white' : ''
              } max-sm:px-[14px] max-sm:py-[7px] max-sm:text-[13px]`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span
                className={`text-[11px] font-bold rounded-full px-2 py-[2px] tracking-0 ${
                  filter === f ? 'bg-[rgba(255,255,255,0.18)]' : 'bg-gray-50 text-gray-500'
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-[1fr_auto_1fr] row-gap-6 column-gap-0 items-stretch max-md:grid-cols-1 max-md:row-gap-4">
            {Array.from({ length: 4 }).map((_, i) => {
              const isEven = i % 2 === 1;
              return (
                <React.Fragment key={i}>
                  {isEven && (
                    <div className="flex items-center justify-center px-5 text-[48px] font-black italic text-gray-200 select-none pointer-events-none leading-none self-center max-md:hidden max-lg:px-[14px] max-lg:text-[40px]">
                      /
                    </div>
                  )}
                  <RaffleCardSkeleton />
                </React.Fragment>
              );
            })}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-[14px] py-[100px_20px] text-center text-gray-500">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-[14px] py-[100px_20px] text-center text-gray-500">
            <span className="text-[52px]">🎟️</span>
            <p className="text-xl font-extrabold uppercase text-gray-900 m-0">No raffles found</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-[1fr_auto_1fr] row-gap-6 column-gap-0 items-stretch max-md:grid-cols-1 max-md:row-gap-4">
            {filtered.map((raffle, i) => {
              const isEven = i % 2 === 1;
              return (
                <React.Fragment key={raffle.id}>
                  {isEven && (
                    <div className="flex items-center justify-center px-5 text-[48px] font-black italic text-gray-200 select-none pointer-events-none leading-none self-center max-md:hidden max-lg:px-[14px] max-lg:text-[40px]">
                      /
                    </div>
                  )}
                  <RaffleCard
                    raffle={raffle}
                    onEnter={handleEnterRaffle}
                    hasEntered={hasEntered(raffle.id)}
                    ticketNumber={getTicketNum(raffle.id)}
                    userId={userId}
                  />
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RafflePage;
