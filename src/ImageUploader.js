import React from 'react';

const styl = {
  position: `absolute`,
  top: 0,
  left: 0,
  border: `1px solid`,
  backgroundColor: `aliceblue`,
  width: `100%`,
  height: `100%`,
}

export function ImageUploader() {
  return (
    <div style={styl}>
      image uploader
    </div>
  );
}
