import React from 'react';
import YtThumb from './YtThumb';
import { seriesTitleSize } from '../utils';

// A cover for a series with no cover art: one of its video pictures, blurred, darkened and grainy,
// with the series name and details on top in white. A series with no video gets a plain dark backdrop.
export default function SeriesCover({ name, details, thumb, className = '' }) {
  return (
    <div className={`series-cover ${className}`}>
      {thumb && <YtThumb id={thumb} className="series-cover-img" />}
      <span aria-hidden="true" className="series-cover-grain" />
      <span className="series-cover-text">
        <span className={`series-cover-name ${seriesTitleSize(name)}`}>{name}</span>
        {details && <span className="series-cover-details text-xs">{details}</span>}
      </span>
    </div>
  );
}
