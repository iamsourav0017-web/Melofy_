import React, { useId } from 'react';
import { motion } from 'motion/react';

interface MelofyCoupleLineArtProps {
  isPlaying: boolean;
  audioOverall: number;
  audioBass: number;
  mouseOffset: { x: number; y: number };
  reducedMotion?: boolean;
}

/**
 * Editorial Line-Art Romantic Couple Illustration
 * Designed to faithfully recreate the style and composition of the reference artwork:
 * - A young couple walking side by side, holding hands, looking at each other with intimate eye contact.
 * - Man in casual blazer, open shirt, slim trousers and sneakers.
 * - Woman in flowing summer dress with fluttering hem, long wind-blown wavy hair.
 * - Delicate graphite/charcoal contours with soft translucent fills and cyan rim accents.
 */
export const MelofyCoupleLineArt: React.FC<MelofyCoupleLineArtProps> = ({
  isPlaying,
  audioOverall,
  audioBass,
  mouseOffset,
  reducedMotion = false
}) => {
  const gradientId = useId();

  // Gentle breathing and musical sway offsets
  const breatheY = reducedMotion ? 0 : Math.sin(Date.now() * 0.002) * (isPlaying ? 3 + audioBass * 4 : 1.8);
  const hairSway = reducedMotion ? 0 : Math.sin(Date.now() * 0.003) * (isPlaying ? 5 + audioOverall * 8 : 2.5);
  const dressSway = reducedMotion ? 0 : Math.cos(Date.now() * 0.0025) * (isPlaying ? 6 + audioBass * 7 : 3);

  // Parallax transform
  const coupleX = mouseOffset.x * 12;
  const coupleY = mouseOffset.y * 8 + breatheY;

  return (
    <div
      className="w-full h-full relative flex items-center justify-center pointer-events-none select-none"
      style={{
        transform: `translate3d(${coupleX}px, ${coupleY}px, 0px)`,
        transition: 'transform 0.12s cubic-bezier(0.2, 0, 0.2, 1)'
      }}
    >
      <svg
        viewBox="0 0 900 820"
        className="w-full h-full max-h-[640px] drop-shadow-xs object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle cyan glow for rim highlights */}
          <linearGradient id={`${gradientId}-cyanGlow`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15BCDF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#15BCDF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#15BCDF" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id={`${gradientId}-warmShade`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EADBCC" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#D5C5B5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E2D4C6" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id={`${gradientId}-dressShade`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#EFECE6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#E1DCD4" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id={`${gradientId}-hairShadeMan`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3C3632" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5E564F" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id={`${gradientId}-hairShadeWoman`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#52463E" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#7A685D" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#B39B8C" stopOpacity="0.05" />
          </linearGradient>

          <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* GROUND REFLECTION & WATER RIPPLES AT FEET            */}
        {/* ---------------------------------------------------- */}
        <g opacity="0.45" stroke="#171A1C" strokeWidth="0.8" strokeLinecap="round">
          {/* Man foot reflection */}
          <path d="M 370 730 C 350 734 320 735 305 738 C 290 741 330 745 365 742" opacity="0.3" />
          <path d="M 380 735 C 410 736 430 738 450 741 C 410 744 385 743 370 741" opacity="0.25" />
          {/* Woman foot reflection */}
          <path d="M 520 735 C 500 738 480 740 470 742 C 495 745 535 744 550 742" opacity="0.3" />
          <path d="M 535 740 C 560 741 590 743 615 746 C 580 748 545 747 525 744" opacity="0.25" />
          {/* Ground water ripples */}
          <ellipse cx="450" cy="740" rx="180" ry="12" stroke="#15BCDF" strokeWidth="0.75" opacity={0.25 + audioOverall * 0.3} strokeDasharray="6 8" />
          <ellipse cx="440" cy="752" rx="130" ry="8" stroke="#171A1C" strokeWidth="0.5" opacity="0.2" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* TRANSLUCENT BODY & CLOTHING UNDERLAY SHADES          */}
        {/* ---------------------------------------------------- */}
        <g>
          {/* Man Blazer Underlay */}
          <path
            d="M 315 255 C 330 240 375 238 405 242 C 430 245 465 260 472 300 C 478 340 475 420 460 480 C 445 530 435 535 410 530 C 375 525 340 528 320 520 C 300 480 295 380 300 310 C 305 270 310 260 315 255 Z"
            fill={`url(#${gradientId}-warmShade)`}
          />

          {/* Man Trousers Underlay */}
          <path
            d="M 325 515 C 345 520 380 522 410 520 C 435 518 445 525 440 550 C 435 600 425 680 415 725 C 395 730 375 730 370 715 C 370 680 375 620 372 580 C 368 580 365 630 360 680 C 355 715 340 725 320 720 C 305 670 310 580 325 515 Z"
            fill="#EFECE6"
            fillOpacity="0.4"
          />

          {/* Woman Dress Flowing Underlay */}
          <path
            d={`M 515 315 C 530 300 560 300 575 315 C 590 330 600 380 595 435 C 590 455 570 460 550 458 C 535 456 515 450 505 440 C 495 390 500 330 515 315 Z`}
            fill={`url(#${gradientId}-dressShade)`}
          />
          <path
            d={`M 505 445 C 530 455 570 458 595 445 C 625 500 660 570 670 635 C 675 665 660 685 640 680 C 600 670 560 635 540 600 C 520 635 490 655 470 650 C 455 645 460 610 470 570 C 485 510 495 465 505 445 Z`}
            fill={`url(#${gradientId}-dressShade)`}
            style={{
              transform: `rotate(${dressSway * 0.4}deg) translate(${dressSway * 1.2}px, 0px)`,
              transformOrigin: '550px 450px',
              transition: 'transform 0.1s ease-out'
            }}
          />
        </g>

        {/* ---------------------------------------------------- */}
        {/* MAN FIGURE (Left) - Line Art Contours                */}
        {/* ---------------------------------------------------- */}
        <g id="man-figure" stroke="#171A1C" strokeLinecap="round" strokeLinejoin="round">
          {/* Hair & Head Outline */}
          <g strokeWidth="1.3">
            {/* Hair volume & textured lock strokes */}
            <path
              d="M 360 165 C 370 145 395 130 425 135 C 455 140 475 160 480 185 C 485 205 475 220 460 225 C 445 230 440 215 445 200 C 450 185 440 165 420 155 C 400 145 375 155 365 175 C 355 195 360 215 362 230 C 355 225 350 205 352 190 C 352 180 355 170 360 165 Z"
              fill={`url(#${gradientId}-hairShadeMan)`}
            />
            {/* Hair texture strands */}
            <path d="M 385 142 C 405 150 425 165 435 185" strokeWidth="0.8" opacity="0.65" />
            <path d="M 405 138 C 430 148 450 168 458 195" strokeWidth="0.8" opacity="0.65" />
            <path d="M 425 142 C 445 155 465 180 468 210" strokeWidth="0.8" opacity="0.6" />
            <path d="M 370 168 C 380 185 392 205 395 225" strokeWidth="0.75" opacity="0.5" />
            {/* Forehead fringe falling right toward woman */}
            <path d="M 445 170 C 455 180 460 195 455 210" strokeWidth="1.1" />
            <path d="M 430 165 C 442 178 448 198 442 215" strokeWidth="0.9" />
          </g>

          {/* Man Face Profile & Features (Turned 3/4 right toward her) */}
          <g strokeWidth="1.1">
            {/* Forehead to nose tip */}
            <path d="M 442 185 C 445 192 448 198 454 204 C 456 206 458 212 454 215 C 450 218 446 218 444 222 C 446 225 450 227 448 230 C 445 233 440 233 438 237 C 435 244 425 248 415 250" />
            {/* Eye looking warmly right at her */}
            <path d="M 436 198 C 440 196 445 198 448 202" strokeWidth="1.2" />
            <circle cx="443" cy="201" r="1.2" fill="#171A1C" />
            {/* Eyebrow */}
            <path d="M 432 192 C 438 190 445 192 450 196" strokeWidth="1.0" opacity="0.8" />
            {/* Gentle smile / lips */}
            <path d="M 444 224 C 441 224 438 226 436 226" strokeWidth="1.0" />
            {/* Jawline & Chin */}
            <path d="M 438 237 C 430 244 418 248 408 248 C 398 248 392 238 390 228" strokeWidth="1.1" opacity="0.9" />
            {/* Ear */}
            <path d="M 388 205 C 385 200 378 202 378 212 C 378 222 384 226 388 224" strokeWidth="0.9" opacity="0.75" />
            {/* Neck */}
            <path d="M 415 250 C 418 260 422 272 425 285" strokeWidth="1.0" />
            <path d="M 385 232 C 380 250 378 268 375 280" strokeWidth="0.9" opacity="0.7" />
          </g>

          {/* Man Upper Body / Jacket & Shirt */}
          <g strokeWidth="1.2">
            {/* Jacket Collar & Lapels */}
            <path d="M 375 275 C 350 280 325 292 315 315 C 305 340 300 400 302 460 C 304 495 312 525 320 540" />
            <path d="M 425 275 C 445 282 465 295 472 320 C 480 350 478 410 468 470 C 460 515 450 535 440 545" />
            {/* Left Lapel (his right side) */}
            <path d="M 375 275 L 358 335 L 382 390 L 375 490" strokeWidth="1.0" />
            {/* Right Lapel (his left side) */}
            <path d="M 425 275 L 438 335 L 420 395 L 425 490" strokeWidth="1.0" />
            {/* Inner shirt neckline & button placket */}
            <path d="M 385 285 C 395 305 405 305 415 285" strokeWidth="1.0" />
            <path d="M 400 305 L 400 430" strokeWidth="0.75" strokeDasharray="1 10" />
            <circle cx="400" cy="335" r="1" fill="#171A1C" />
            <circle cx="400" cy="365" r="1" fill="#171A1C" />
            <circle cx="400" cy="395" r="1" fill="#171A1C" />
            {/* Shirt creases & jacket folds */}
            <path d="M 360 380 C 375 390 390 385 400 390" strokeWidth="0.7" opacity="0.6" />
            <path d="M 402 410 C 415 415 425 408 435 412" strokeWidth="0.7" opacity="0.6" />
            <path d="M 365 440 C 385 450 410 445 430 450" strokeWidth="0.7" opacity="0.5" />
            {/* Pocket square accent */}
            <path d="M 445 355 L 465 352" strokeWidth="0.9" opacity="0.7" />
          </g>

          {/* Man Arms & Hands */}
          <g strokeWidth="1.1">
            {/* Left Arm (relaxed at side / hand near pocket) */}
            <path d="M 315 315 C 310 360 305 415 315 470 C 320 495 330 520 340 535" />
            <path d="M 338 520 C 342 532 345 545 350 550 C 354 554 360 550 362 542" strokeWidth="0.9" />

            {/* Right Arm (reaching inward to hold her hand) */}
            <path d="M 472 320 C 485 365 490 410 488 460 C 485 495 475 525 465 550" />
            <path d="M 445 370 C 455 410 460 455 455 495 C 452 520 445 538 440 550" strokeWidth="0.8" opacity="0.7" />
            {/* Man's hand gripping woman's hand */}
            <path d="M 465 550 C 468 558 472 568 475 578 C 478 584 485 586 488 580 C 490 574 485 565 480 558" strokeWidth="1.2" />
            <path d="M 472 565 C 476 572 480 578 485 582" strokeWidth="0.8" />
          </g>

          {/* Man Trousers & Walking Legs */}
          <g strokeWidth="1.2">
            {/* Waistband */}
            <path d="M 345 515 C 375 522 410 520 435 515" strokeWidth="1.0" />
            {/* Left Leg (stepping forward) */}
            <path d="M 340 525 C 342 570 345 615 352 660 C 358 695 362 720 365 735" />
            <path d="M 378 535 C 382 575 385 620 388 665 C 390 698 392 720 395 735" strokeWidth="1.0" />
            {/* Right Leg (stepping slightly back) */}
            <path d="M 410 525 C 415 565 422 610 428 655 C 434 690 438 715 440 730" strokeWidth="1.0" />
            <path d="M 435 530 C 445 570 452 615 456 660 C 458 690 458 715 456 730" strokeWidth="0.9" opacity="0.8" />
            {/* Trouser fabric creases & drapery */}
            <path d="M 350 580 C 362 590 375 585 385 590" strokeWidth="0.65" opacity="0.55" />
            <path d="M 355 640 C 368 650 378 645 388 650" strokeWidth="0.65" opacity="0.55" />
            <path d="M 420 590 C 430 600 440 595 448 600" strokeWidth="0.65" opacity="0.5" />
            <path d="M 425 645 C 435 652 445 648 452 655" strokeWidth="0.65" opacity="0.5" />
          </g>

          {/* Man Shoes (Casual sneakers) */}
          <g strokeWidth="1.1">
            {/* Left shoe */}
            <path d="M 362 735 C 358 738 348 740 338 742 C 342 748 375 750 395 745 C 398 740 396 735 394 735 Z" fill="#E8E5DF" />
            <path d="M 345 744 L 388 746" strokeWidth="0.75" opacity="0.6" />
            {/* Right shoe */}
            <path d="M 438 730 C 432 734 425 738 418 740 C 425 745 450 746 460 740 C 458 735 452 730 448 730 Z" fill="#E8E5DF" opacity="0.85" />
          </g>
        </g>

        {/* ---------------------------------------------------- */}
        {/* WOMAN FIGURE (Right) - Line Art Contours              */}
        {/* ---------------------------------------------------- */}
        <g id="woman-figure" stroke="#171A1C" strokeLinecap="round" strokeLinejoin="round">
          
          {/* Flowing Long Hair (Blowing right with wind & music) */}
          <g
            strokeWidth="1.2"
            style={{
              transform: `rotate(${hairSway * 0.3}deg) translate(${hairSway * 0.8}px, 0px)`,
              transformOrigin: '560px 180px',
              transition: 'transform 0.12s ease-out'
            }}
          >
            {/* Main Hair Volume Silhouette */}
            <path
              d="M 545 155 C 565 140 600 145 625 160 C 655 180 690 215 715 255 C 730 280 725 310 700 325 C 670 340 635 320 620 295 C 605 270 595 240 585 215 C 570 230 555 240 540 235 C 530 210 535 175 545 155 Z"
              fill={`url(#${gradientId}-hairShadeWoman)`}
            />
            {/* Dynamic wind-blown hair locks extending into the musical field */}
            <path d="M 580 155 C 615 165 655 190 685 225 C 715 260 735 295 745 330" strokeWidth="1.0" opacity="0.85" />
            <path d="M 600 170 C 635 185 670 215 698 255 C 720 290 732 325 735 355" strokeWidth="0.85" opacity="0.75" />
            <path d="M 620 190 C 650 210 680 240 705 280 C 720 310 725 345 720 375" strokeWidth="0.75" opacity="0.65" />
            <path d="M 565 170 C 585 195 605 230 615 270 C 625 310 630 350 635 385" strokeWidth="0.85" opacity="0.7" />
            {/* Delicate wisps floating freely */}
            <path d="M 670 205 C 705 215 740 240 760 270 C 775 295 770 320 755 335" stroke="#15BCDF" strokeWidth="0.85" opacity="0.6" />
            <path d="M 690 245 C 725 260 755 285 770 315" stroke="#15BCDF" strokeWidth="0.65" opacity="0.5" />
            {/* Front soft bangs framing face */}
            <path d="M 545 160 C 538 175 536 195 540 215" strokeWidth="1.0" />
            <path d="M 552 165 C 546 182 546 202 550 220" strokeWidth="0.8" opacity="0.7" />
          </g>

          {/* Woman Face Profile (Turned 3/4 left looking warmly toward man) */}
          <g strokeWidth="1.1">
            {/* Forehead to nose tip & lips */}
            <path d="M 540 185 C 536 190 532 196 526 202 C 523 205 524 210 528 212 C 531 214 534 216 532 220 C 529 223 526 224 528 227 C 530 230 535 231 536 235 C 538 242 548 248 558 250" />
            {/* Eye looking warmly left at him */}
            <path d="M 536 198 C 532 196 528 198 525 202" strokeWidth="1.2" />
            <circle cx="529" cy="201" r="1.1" fill="#171A1C" />
            {/* Delicate eyelash/brow */}
            <path d="M 540 192 C 534 190 527 192 522 196" strokeWidth="0.9" opacity="0.85" />
            <path d="M 524 199 L 521 197" strokeWidth="0.8" />
            {/* Sweet subtle smile */}
            <path d="M 528 222 C 531 222 534 224 536 224" strokeWidth="0.95" />
            {/* Jawline & Chin */}
            <path d="M 536 235 C 545 242 555 245 565 244" strokeWidth="1.0" opacity="0.9" />
            {/* Slender neck & collarbone */}
            <path d="M 552 248 C 550 260 548 275 545 290" strokeWidth="0.95" />
            <path d="M 570 245 C 572 260 575 275 580 290" strokeWidth="0.85" opacity="0.75" />
            <path d="M 538 295 C 555 300 570 300 585 295" strokeWidth="0.75" opacity="0.5" />
          </g>

          {/* Woman Sleeveless Dress - Bodice & Waist */}
          <g strokeWidth="1.2">
            {/* Bodice neckline & straps */}
            <path d="M 535 295 C 545 315 560 325 575 320 C 585 315 595 295 598 295" />
            <path d="M 528 320 C 525 365 522 410 525 450" />
            <path d="M 598 320 C 602 365 600 410 592 450" />
            {/* Delicate fabric gathering on bodice */}
            <path d="M 545 330 C 558 345 572 345 585 335" strokeWidth="0.7" opacity="0.6" />
            <path d="M 540 365 C 555 380 575 378 588 368" strokeWidth="0.7" opacity="0.6" />
            <path d="M 535 405 C 552 420 572 418 586 408" strokeWidth="0.7" opacity="0.55" />
            {/* Waist Tie Ribbon & Bow */}
            <path d="M 525 448 C 550 455 575 455 595 448" strokeWidth="1.1" />
            <path d="M 585 450 C 595 458 605 460 610 455 C 612 450 605 445 595 448" strokeWidth="0.9" />
            <path d="M 602 458 C 608 475 612 495 615 515" strokeWidth="0.85" opacity="0.8" />
            <path d="M 598 458 C 600 480 602 505 605 525" strokeWidth="0.85" opacity="0.8" />
          </g>

          {/* Woman Arms & Handholding */}
          <g strokeWidth="1.1">
            {/* Left Arm (her right arm extending to hold man's hand) */}
            <path d="M 528 320 C 515 365 505 415 500 465 C 496 500 492 530 488 560" />
            <path d="M 518 360 C 510 405 505 450 502 495 C 500 525 496 550 492 568" strokeWidth="0.8" opacity="0.7" />
            {/* Woman's delicate fingers interlaced with his */}
            <path d="M 488 560 C 485 568 480 576 476 582 C 473 585 470 580 472 575 C 475 568 480 562 485 556" strokeWidth="1.1" />

            {/* Right Arm (her left arm relaxed by side holding skirt softly) */}
            <path d="M 598 320 C 615 365 625 415 630 465 C 632 500 628 535 620 565" />
            <path d="M 620 565 C 618 572 612 578 608 580 C 605 578 608 570 612 562" strokeWidth="0.9" />
          </g>

          {/* Flowing Skirt (Swirling dynamically with music breeze) */}
          <g
            strokeWidth="1.2"
            style={{
              transform: `rotate(${dressSway * 0.45}deg) translate(${dressSway * 1.4}px, 0px)`,
              transformOrigin: '550px 450px',
              transition: 'transform 0.1s ease-out'
            }}
          >
            {/* Skirt left contour */}
            <path d="M 525 450 C 515 500 500 555 485 610 C 472 650 462 675 455 690" />
            {/* Skirt right fluttering contour catching the wind */}
            <path d="M 595 450 C 625 500 660 565 685 625 C 700 655 705 675 695 688 C 682 698 660 690 642 675" />
            {/* Diagonal hemline with flowing folds and layered flounces */}
            <path d="M 455 690 C 475 685 505 665 530 670 C 555 675 580 695 610 690 C 635 685 665 665 695 688" strokeWidth="1.3" />
            {/* Inner layered flounce line */}
            <path d="M 470 665 C 495 655 525 640 550 645 C 580 650 610 670 645 655 C 665 645 680 635 690 645" strokeWidth="0.9" opacity="0.75" />
            {/* Flowing vertical drape creases */}
            <path d="M 540 455 C 535 510 525 570 515 635 C 510 655 505 670 500 680" strokeWidth="0.8" opacity="0.6" />
            <path d="M 560 455 C 560 515 562 575 565 635 C 568 660 570 675 572 688" strokeWidth="0.8" opacity="0.6" />
            <path d="M 580 455 C 595 510 615 565 638 625 C 648 650 655 668 660 680" strokeWidth="0.8" opacity="0.6" />
            {/* Cyan musical shimmer along hem */}
            <path d="M 460 692 C 510 678 570 692 630 685 C 665 675 685 685 698 688" stroke="#15BCDF" strokeWidth="1.1" opacity={0.5 + audioOverall * 0.4} />
          </g>

          {/* Woman Walking Legs & Elegant Feet */}
          <g strokeWidth="1.1">
            {/* Left Leg (gracefully stepping forward) */}
            <path d="M 545 630 C 548 660 552 690 555 715 C 558 728 560 735 562 740" />
            <path d="M 562 630 C 565 660 568 690 570 715 C 572 728 574 735 575 740" strokeWidth="0.9" opacity="0.85" />
            {/* Right Leg (gracefully stepping back) */}
            <path d="M 585 635 C 595 665 605 695 615 720 C 618 728 620 735 622 738" strokeWidth="0.9" opacity="0.8" />
            <path d="M 598 635 C 608 665 618 695 626 720 C 628 728 630 735 632 738" strokeWidth="0.8" opacity="0.65" />
            {/* Elegant low-heel pump / shoes */}
            <path d="M 560 740 C 555 742 548 745 540 746 C 545 750 568 751 578 746 C 578 742 575 740 572 740 Z" fill="#E8E5DF" />
            <path d="M 618 738 C 612 740 606 743 600 744 C 605 748 624 748 632 743 C 630 740 626 738 624 738 Z" fill="#E8E5DF" opacity="0.8" />
          </g>
        </g>

        {/* ---------------------------------------------------- */}
        {/* INTERLACED HANDS & CENTRAL STORY ENERGY GLOW         */}
        {/* ---------------------------------------------------- */}
        <g>
          {/* Cyan connection orb at their joined hands */}
          <circle
            cx="480"
            cy="572"
            r={6 + (isPlaying ? audioBass * 10 : 2)}
            fill="#15BCDF"
            fillOpacity={0.25 + audioOverall * 0.35}
            filter={`url(#${gradientId}-glow)`}
          />
          <circle
            cx="480"
            cy="572"
            r="2.5"
            fill="#FFFFFF"
            opacity="0.9"
          />
          {/* Subtle spark rays */}
          <line x1="472" y1="572" x2="488" y2="572" stroke="#15BCDF" strokeWidth="0.8" opacity="0.7" />
          <line x1="480" y1="564" x2="480" y2="580" stroke="#15BCDF" strokeWidth="0.8" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
};
