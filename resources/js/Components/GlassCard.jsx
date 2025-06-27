/** @jsxImportSource @emotion/react */
import React, { forwardRef, useEffect } from 'react';
import { Card, Fade } from '@mui/material';
import { css } from '@emotion/react';

const injectSVGFilter = () => {
  const id = 'liquid-glass-svg-filter';
  if (document.getElementById(id)) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'display: none');
  svg.setAttribute('id', id);
  svg.innerHTML = `
    <filter id="glass-warp-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turb"/>
      <feGaussianBlur in="turb" stdDeviation="3" result="smoothTurb"/>
      <feSpecularLighting in="smoothTurb" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
        <fePointLight x="-100" y="-100" z="200"/>
      </feSpecularLighting>
      <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit"/>
      <feDisplacementMap in="SourceGraphic" in2="smoothTurb" scale="70" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  `;
  document.body.appendChild(svg);
};

const GlassCard = forwardRef(({ children, show = true, ...props }, ref) => {
  useEffect(() => {
    injectSVGFilter();
  }, []);

  return (
    <Fade in={show} timeout={600}>
      <Card
        ref={ref}
        elevation={0}
        {...props}
        css={css`
          position: relative;
          border-radius: 20px;
          isolation: isolate;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(1px);
          -webkit-backdrop-filter: blur(1px);
          transition: transform 0.3s ease;

          &:hover {
            transform: scale(1.03);
          }

          &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 0;
            filter: url(#glass-warp-filter);
            backdrop-filter: blur(2px) saturate(120%);
            -webkit-backdrop-filter: blur(2px) saturate(120%);
          }

          &::after {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            background: rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.6);
          }

          > * {
            position: relative;
            z-index: 2;
            padding: 20px;
            color: #fff;
          }
        `}
      >
        {children}
      </Card>
    </Fade>
  );
});

export default GlassCard;
