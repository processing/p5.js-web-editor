
const isSecurePage = () => (
  window.location.protocol === 'https:'
);

export default isSecurePage;
