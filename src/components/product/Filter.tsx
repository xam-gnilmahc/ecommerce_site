import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

const AVAILABILITY = [
  { value: 'in', label: 'In stock' },
  { value: 'out', label: 'Out of stock' },
];

const EMPTY_FILTERS = {
  priceRange: null,
  availability: [],
};

const Check = ({ checked, onChange, label }) => (
  <label className="facet-check">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="facet-check__box" aria-hidden="true" />
    <span className="facet-check__label">{label}</span>
  </label>
);

const Filters = ({ filters, onChange, resultCount, maxPrice, minPrice, sort }) => {
  const [openPanel, setOpenPanel] = useState('sort');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const drawerRef = useRef(null);

  const current = { ...EMPTY_FILTERS, ...(filters || {}) };

  useEffect(() => {
    if (current.priceRange) {
      setPriceMin(String(current.priceRange[0]));
      setPriceMax(String(current.priceRange[1]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.priceRange?.[0], current.priceRange?.[1]]);

  // close open panel on outside click
  useEffect(() => {
    const onDown = (e) => {
      const inDrawer = drawerRef.current && drawerRef.current.contains(e.target);
      if (!inDrawer) setOpenPanel(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [drawerOpen]);

  const activeCount = current.availability.length + (current.priceRange ? 1 : 0);

  const toggleValue = (key, value) => {
    const list = current[key];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    onChange({ ...current, [key]: next });
  };

  const applyPrice = () => {
    if (priceMin === '' && priceMax === '') {
      onChange({ ...current, priceRange: null });
      return;
    }
    const min = priceMin === '' ? minPrice || 0 : Number(priceMin);
    const max = priceMax === '' ? maxPrice || 999999 : Number(priceMax);
    if (Number.isNaN(min) || Number.isNaN(max)) return;
    onChange({ ...current, priceRange: [min, max] });
  };

  const clearPrice = () => {
    setPriceMin('');
    setPriceMax('');
    onChange({ ...current, priceRange: null });
  };

  const clearAll = () => {
    setPriceMin('');
    setPriceMax('');
    onChange({ ...EMPTY_FILTERS });
  };

  const renderPanel = (id, label, content) => (
    <details
      key={id}
      className={`facet ${openPanel === id ? 'is-open' : ''}`}
      open={openPanel === id}
      onToggle={(e) => {
        if ((e.target as HTMLDetailsElement).open) setOpenPanel(id);
        else setOpenPanel((prev) => (prev === id ? null : prev));
      }}
    >
      <summary className="facet__summary">
        <span className="facet__label">{label}</span>
        <span className="facet__caret" aria-hidden="true" />
      </summary>
      <div className="facet__panel">{content}</div>
    </details>
  );

  const pricePanel = (
    <div className="facet-price">
      <div className="facet-price__inputs">
        <label className="facet-price__field">
          <span>$</span>
          <input
            type="number"
            min="0"
            placeholder={String(minPrice || 0)}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            aria-label="Low price"
          />
        </label>
        <span className="facet-price__dash">–</span>
        <label className="facet-price__field">
          <span>$</span>
          <input
            type="number"
            min="0"
            placeholder={maxPrice ? String(maxPrice) : 'Max'}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            aria-label="High price"
          />
        </label>
      </div>
      <div className="facet-price__foot">
        <p className="facet-price__hint">
          {maxPrice ? `The highest price is $${maxPrice}` : 'Enter a price range'}
        </p>
        <button type="button" className="facet__clear" onClick={clearPrice}>
          Clear
        </button>
      </div>
    </div>
  );

  const availabilityPanel = (
    <div className="facet__list">
      {AVAILABILITY.map((opt) => (
        <Check
          key={opt.value}
          label={opt.label}
          checked={current.availability.includes(opt.value)}
          onChange={() => toggleValue('availability', opt.value)}
        />
      ))}
    </div>
  );

  const panels = (
    <>
      {renderPanel('sort', 'Sort', sort)}
      {renderPanel('price', 'Price', pricePanel)}
      {renderPanel('availability', 'Availability', availabilityPanel)}
    </>
  );

  return (
    <div className="facets-block">
      {/* shop products / filter toggle */}
      <div className="facets-toggle">
        <p className="facets-toggle__title">Shop Products</p>
        <button type="button" className="facets-toggle__button" onClick={() => setDrawerOpen(true)}>
          Filter
          {activeCount > 0 && <span className="facets-toggle__count">({activeCount})</span>}
        </button>
      </div>

      {/* filter drawer */}
      {drawerOpen && (
        <div className="facets-drawer" role="dialog" aria-modal="true">
          <div className="facets-drawer__overlay" onClick={() => setDrawerOpen(false)} />
          <div className="facets-drawer__dialog" ref={drawerRef}>
            <div className="facets-drawer__header">
              <p className="facets-drawer__title">
                Filter {activeCount > 0 && <span>({activeCount})</span>}
              </p>
              <button
                type="button"
                className="facets-drawer__close"
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="facets-drawer__body">{panels}</div>

            <div className="facets-drawer__actions">
              <button type="button" className="facets-drawer__clear" onClick={clearAll}>
                Clear all
              </button>
              <button
                type="button"
                className="facets-drawer__see"
                onClick={() => setDrawerOpen(false)}
              >
                See {resultCount} items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
