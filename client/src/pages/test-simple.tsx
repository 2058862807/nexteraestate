export default function TestSimple() {
  const handleClick = () => {
    alert('Button clicked successfully!');
    console.log('Button click detected');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
        Simple Button Test
      </h1>
      
      <button 
        onClick={handleClick}
        style={{
          padding: '20px 40px',
          fontSize: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        CLICK ME TO TEST
      </button>
      
      <p style={{ marginTop: '20px', fontSize: '16px' }}>
        If this button doesn't work, there's a system-level JavaScript blocking issue.
      </p>
      
      <div style={{ marginTop: '30px' }}>
        <input 
          type="text" 
          placeholder="Test typing here"
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '4px',
            width: '300px'
          }}
        />
      </div>
    </div>
  );
}