export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatSpeed = (kmh) => {
  return `${Math.round(kmh || 0)} km/j`;
};

export const formatDistance = (km) => {
  if (km === undefined || km === null) return '0 km';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${Number(km).toFixed(1)} km`;
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return 'Tiba sekarang';
  if (minutes < 60) return `${minutes} menit`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} jam ${mins} mnt` : `${hrs} jam`;
};

export const getDensityBadge = (occupancy, capacity) => {
  const ratio = (occupancy || 0) / (capacity || 1);
  if (ratio >= 0.9) {
    return {
      label: 'Penuh (Hampir Penuh)',
      status: 'full',
      color: 'text-rose-400 bg-rose-500/20 border-rose-500/40',
      dotColor: '#f43f5e'
    };
  }
  if (ratio >= 0.6) {
    return {
      label: 'Sedang (Kursi Terbatas)',
      status: 'medium',
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/40',
      dotColor: '#fbbf24'
    };
  }
  return {
    label: 'Tersedia (Banyak Kursi Kosong)',
    status: 'low',
    color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
    dotColor: '#10b981'
  };
};
