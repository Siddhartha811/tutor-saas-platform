export const formatDateHeading = (date) =>
  new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const toDatetimeLocal = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};