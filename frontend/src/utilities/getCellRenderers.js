export const getCellRenderers = () => ({
    avatar: ({ value }) =>
      value ? (
        <img
          src={value}
          alt="avatar"
          style={{ width: '24px', height: '24px', borderRadius: '50%' }}
        />
      ) : null,
      
    github: ({ value }) =>
      value ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : null,

    url: ({ value }) =>
      value ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : null,
  });