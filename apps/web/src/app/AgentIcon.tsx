export function AgentIcon({ agent, size = 24 }: { agent: string; size?: number }) {
  if (agent === 'Claude Code') return <ClaudeCodeIcon size={size} />
  if (agent === 'Antigravity') return <AntigravityIcon size={size} />
  if (agent === 'Goose') return <img src="/goose.png" width={size} height={size} style={{ objectFit: 'contain' }} alt="Goose" />
  if (agent === 'GitHub Copilot') return <GitHubCopilotIcon size={size} />
  if (agent === 'Kilo Code') return <KiloCodeIcon size={size} />
  if (agent === 'Cursor') return <CursorIcon size={size} />
  if (agent === 'OpenCode') return <OpenCodeIcon size={size} />
  if (agent === 'Gemini CLI') return <GeminiCLIIcon size={size} />
  if (agent === 'Windsurf') return <WindsurfIcon size={size} />
  if (agent === 'Trae') return <TraeIcon size={size} />
  if (agent === 'OpenAI Codex') return <img src="/codex.png" width={size} height={size} style={{ objectFit: 'contain' }} alt="OpenAI Codex" />
  return null
}

function ClaudeCodeIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 1200 1200">
      <path fill="#d97757" d="M 233.959793 800.214905 L 468.644287 668.536987 L 472.590637 657.100647 L 468.644287 650.738403 L 457.208069 650.738403 L 417.986633 648.322144 L 283.892639 644.69812 L 167.597321 639.865845 L 54.926208 633.825623 L 26.577238 627.785339 L 3.3e-05 592.751709 L 2.73832 575.27533 L 26.577238 559.248352 L 60.724873 562.228149 L 136.187973 567.382629 L 249.422867 575.194763 L 331.570496 580.026978 L 453.261841 592.671082 L 472.590637 592.671082 L 475.328857 584.859009 L 468.724915 580.026978 L 463.570557 575.194763 L 346.389313 495.785217 L 219.543671 411.865906 L 153.100723 363.543762 L 117.181267 339.060425 L 99.060455 316.107361 L 91.248367 266.01355 L 123.865784 230.093994 L 167.677887 233.073853 L 178.872513 236.053772 L 223.248367 270.201477 L 318.040283 343.570496 L 441.825592 434.738342 L 459.946411 449.798706 L 467.194672 444.64447 L 468.080597 441.020203 L 459.946411 427.409485 L 392.617493 305.718323 L 320.778564 181.932983 L 288.80542 130.630859 L 280.348999 99.865845 C 277.369171 87.221436 275.194641 76.590698 275.194641 63.624268 L 312.322174 13.20813 L 332.8591 6.604126 L 382.389313 13.20813 L 403.248352 31.328979 L 434.013519 101.71814 L 483.865753 212.537048 L 561.181274 363.221497 L 583.812134 407.919434 L 595.892639 449.315491 L 600.40271 461.959839 L 608.214783 461.959839 L 608.214783 454.711609 L 614.577271 369.825623 L 626.335632 265.61084 L 637.771851 131.516846 L 641.718201 93.745117 L 660.402832 48.483276 L 697.530334 24.000122 L 726.52356 37.852417 L 750.362549 72 L 747.060486 94.067139 L 732.886047 186.201416 L 705.100708 330.52356 L 686.979919 427.167847 L 697.530334 427.167847 L 709.61084 415.087341 L 758.496704 350.174561 L 840.644348 247.490051 L 876.885925 206.738342 L 919.167847 161.71814 L 946.308838 140.29541 L 997.61084 140.29541 L 1035.38269 196.429626 L 1018.469849 254.416199 L 965.637634 321.422852 L 921.825562 378.201538 L 859.006714 462.765259 L 819.785278 530.41626 L 823.409424 535.812073 L 832.75177 534.92627 L 974.657776 504.724915 L 1051.328979 490.872559 L 1142.818848 475.167786 L 1184.214844 494.496582 L 1188.724854 514.147644 L 1172.456421 554.335693 L 1074.604126 578.496765 L 959.838989 601.449829 L 788.939636 641.879272 L 786.845764 643.409485 L 789.261841 646.389343 L 866.255127 653.637634 L 899.194702 655.409424 L 979.812134 655.409424 L 1129.932861 666.604187 L 1169.154419 692.537109 L 1192.671265 724.268677 L 1188.724854 748.429688 L 1128.322144 779.194641 L 1046.818848 759.865845 L 856.590759 714.604126 L 791.355774 698.335754 L 782.335693 698.335754 L 782.335693 703.731567 L 836.69812 756.885986 L 936.322205 846.845581 L 1061.073975 962.81897 L 1067.436279 991.490112 L 1051.409424 1014.120911 L 1034.496704 1011.704712 L 924.885986 929.234924 L 882.604126 892.107544 L 786.845764 811.48999 L 780.483276 811.48999 L 780.483276 819.946289 L 802.550415 852.241699 L 919.087341 1027.409424 L 925.127625 1081.127686 L 916.671204 1098.604126 L 886.469849 1109.154419 L 853.288696 1103.114136 L 785.073914 1007.355835 L 714.684631 899.516785 L 657.906067 802.872498 L 650.979858 806.81897 L 617.476624 1167.704834 L 601.771851 1186.147705 L 565.530212 1200 L 535.328857 1177.046997 L 519.302124 1139.919556 L 535.328857 1066.550537 L 554.657776 970.792053 L 570.362488 894.68457 L 584.536926 800.134277 L 592.993347 768.724976 L 592.429626 766.630859 L 585.503479 767.516968 L 514.22821 865.369263 L 405.825531 1011.865906 L 320.053711 1103.677979 L 299.516815 1111.812256 L 263.919525 1093.369263 L 267.221497 1060.429688 L 287.114136 1031.114136 L 405.825531 880.107361 L 477.422913 786.52356 L 523.651062 732.483276 L 523.328918 724.671265 L 520.590698 724.671265 L 205.288605 929.395935 L 149.154434 936.644409 L 124.993355 914.01355 L 127.973183 876.885986 L 139.409409 864.80542 L 234.201385 799.570435 Z" />
    </svg>
  )
}

function AntigravityIcon({ size }: { size: number }) {
  return (
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="13 18 85 78" width={size} height={size}>
      <defs>
        <filter id="ag-f0" x="2.49348" y="-26.5423" width="69.0899" height="61.2525" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="3.89034" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f1" x="28.7524" y="-32.0333" width="135.477" height="134.313" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="18.8078" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f2" x="-62.2884" y="-21.9253" width="142.637" height="127.18" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="15.9884" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f5" x="17.3619" y="45.4646" width="116.786" height="118.715" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="15.1937" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f6" x="-7.44765" y="-60.4737" width="125.303" height="122.858" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="13.7698" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f7" x="-27.7086" y="13.3597" width="157.119" height="162.029" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="12.297" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f8" x="50.4638" y="16.981" width="87.3973" height="83.7738" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="11.0036" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f9" x="34.2604" y="-28.457" width="116.701" height="104.506" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="9.29385" result="effect1_foregroundBlur" />
        </filter>
        <filter id="ag-f10" x="-15.1522" y="-15.9493" width="77.2941" height="91.076" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" /><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" /><feGaussianBlur stdDeviation="11.5027" result="effect1_foregroundBlur" />
        </filter>
        <mask id="ag-mask-web" maskUnits="userSpaceOnUse" x="13" y="18" width="85" height="78" style={{ maskType: 'alpha' as const }}>
          <path d="M89.6992 93.695C94.3659 97.195 101.366 94.8617 94.9492 88.445C75.6992 69.7783 79.7825 18.445 55.8659 18.445C31.9492 18.445 36.0325 69.7783 16.7825 88.445C9.78251 95.445 17.3658 97.195 22.0325 93.695C40.1159 81.445 38.9492 59.8617 55.8659 59.8617C72.7825 59.8617 71.6159 81.445 89.6992 93.695Z" fill="black" />
        </mask>
      </defs>
      <path d="M89.6992 93.695C94.3659 97.195 101.366 94.8617 94.9492 88.445C75.6992 69.7783 79.7825 18.445 55.8659 18.445C31.9492 18.445 36.0325 69.7783 16.7825 88.445C9.78251 95.445 17.3658 97.195 22.0325 93.695C40.1159 81.445 38.9492 59.8617 55.8659 59.8617C72.7825 59.8617 71.6159 81.445 89.6992 93.695Z" fill="#3186FF" />
      <g mask="url(#ag-mask-web)">
        <g filter="url(#ag-f0)"><ellipse cx="22.7873" cy="26.8098" rx="22.7873" ry="26.8098" transform="matrix(-0.112784 0.99362 -0.99362 -0.112781 66.2473 -15.5344)" fill="#FFE432" /></g>
        <g filter="url(#ag-f1)"><ellipse cx="96.491" cy="35.1231" rx="29.5007" ry="30.1492" transform="rotate(76.9243 96.491 35.1231)" fill="#FC413D" /></g>
        <g filter="url(#ag-f2)"><ellipse cx="9.02988" cy="41.6647" rx="30.832" ry="39.9417" transform="rotate(74.1257 9.02988 41.6647)" fill="#00B95C" /></g>
        <g filter="url(#ag-f5)"><ellipse cx="75.7546" cy="104.822" rx="29.0177" ry="27.943" transform="rotate(76.9243 75.7546 104.822)" fill="#3186FF" /></g>
        <g filter="url(#ag-f6)"><ellipse cx="33.5661" cy="35.4043" rx="33.5661" ry="35.4043" transform="matrix(-0.409539 0.912293 -0.912294 -0.409537 101.25 -15.1674)" fill="#FBBC04" /></g>
        <g filter="url(#ag-f7)"><path d="M2.56802 149.695C-15.8116 142.48 15.5987 83.1163 23.4093 63.2203C31.22 43.3244 52.4514 33.0447 70.831 40.26C89.2107 47.4753 110.996 87.2162 103.185 107.112C95.3742 127.008 20.9477 156.91 2.56802 149.695Z" fill="#3186FF" /></g>
        <g filter="url(#ag-f8)"><path d="M113.934 75.8079C109.013 81.5509 96.1724 78.6224 85.253 69.2667C74.3335 59.911 69.4704 47.6711 74.391 41.928C79.3116 36.185 92.1525 39.1136 103.072 48.4692C113.991 57.8249 118.855 70.0648 113.934 75.8079Z" fill="#749BFF" /></g>
        <g filter="url(#ag-f9)"><ellipse cx="92.611" cy="23.7962" rx="44.2411" ry="27.5016" transform="rotate(34.0763 92.611 23.7962)" fill="#FC413D" /></g>
        <g filter="url(#ag-f10)"><ellipse cx="23.4949" cy="29.5887" rx="23.7071" ry="13.7869" transform="rotate(112.516 23.4949 29.5887)" fill="#FFEE48" /></g>
      </g>
    </svg>
  )
}

function GitHubCopilotIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={{ verticalAlign: 'text-bottom', display: 'inline-block', overflow: 'visible' }}
    >
      <path d="M7.998 15.035c-4.562 0-7.873-2.914-7.998-3.749V9.338c.085-.628.677-1.686 1.588-2.065.013-.07.024-.143.036-.218.029-.183.06-.384.126-.612-.201-.508-.254-1.084-.254-1.656 0-.87.128-1.769.693-2.484.579-.733 1.494-1.124 2.724-1.261 1.206-.134 2.262.034 2.944.765.05.053.096.108.139.165.044-.057.094-.112.143-.165.682-.731 1.738-.899 2.944-.765 1.23.137 2.145.528 2.724 1.261.566.715.693 1.614.693 2.484 0 .572-.053 1.148-.254 1.656.066.228.098.429.126.612.012.076.024.148.037.218.924.385 1.522 1.471 1.591 2.095v1.872c0 .766-3.351 3.795-8.002 3.795Zm0-1.485c2.28 0 4.584-1.11 5.002-1.433V7.862l-.023-.116c-.49.21-1.075.291-1.727.291-1.146 0-2.059-.327-2.71-.991A3.222 3.222 0 0 1 8 6.303a3.24 3.24 0 0 1-.544.743c-.65.664-1.563.991-2.71.991-.652 0-1.236-.081-1.727-.291l-.023.116v4.255c.419.323 2.722 1.433 5.002 1.433ZM6.762 2.83c-.193-.206-.637-.413-1.682-.297-1.019.113-1.479.404-1.713.7-.247.312-.369.789-.369 1.554 0 .793.129 1.171.308 1.371.162.181.519.379 1.442.379.853 0 1.339-.235 1.638-.54.315-.322.527-.827.617-1.553.117-.935-.037-1.395-.241-1.614Zm4.155-.297c-1.044-.116-1.488.091-1.681.297-.204.219-.359.679-.242 1.614.091.726.303 1.231.618 1.553.299.305.784.54 1.638.54.922 0 1.28-.198 1.442-.379.179-.2.308-.578.308-1.371 0-.765-.123-1.242-.37-1.554-.233-.296-.693-.587-1.713-.7Z" />
      <path d="M6.25 9.037a.75.75 0 0 1 .75.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 .75-.75Zm4.25.75v1.501a.75.75 0 0 1-1.5 0V9.787a.75.75 0 0 1 1.5 0Z" />
    </svg>
  )
}


function CursorIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 466 532" fill="currentColor">
      <path d="M457.4,125.9L244.4,3c-6.8-4-15.3-4-22.1,0L9.3,125.9c-5.8,3.3-9.3,9.5-9.3,16.1v248c0,6.6,3.5,12.8,9.3,16.1l213,123c6.8,4,15.3,4,22.1,0l213-123c5.8-3.3,9.3-9.5,9.3-16.1v-248c0-6.6-3.5-12.8-9.3-16.1h0ZM444,152l-205.6,356.2c-1.4,2.4-5.1,1.4-5.1-1.4v-233.2c0-4.7-2.5-9-6.5-11.3L24.9,145.7c-2.4-1.4-1.4-5.1,1.4-5.1h411.3c5.8,0,9.5,6.3,6.6,11.4h0Z" />
    </svg>
  )
}

function KiloCodeIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} fill="currentColor">
      <path d="M23,26v-2h3v-5l-2-2h-4v2h-3v5l2,2h4ZM20,20h3v3h-3v-3Z"/><rect x="12" y="17" width="3" height="3"/><polygon points="26 12 23 12 23 9 20 6 17 6 17 9 20 9 20 12 17 12 17 15 26 15 26 12"/><path d="M0,0v32h32V0H0ZM29,29H3V3h26v26Z"/><polygon points="15 26 15 23 9 23 9 17 6 17 6 23.1875 8.8125 26 15 26"/><rect x="12" y="6" width="3" height="3"/><polygon points="9 12 12 12 12 15 15 15 15 12 12 9 9 9 9 6 6 6 6 15 9 15 9 12"/>
    </svg>
  )
}

function OpenCodeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 32H8V16H24V32Z" fill="#4B4646"/>
      <path d="M24 8H8V32H24V8ZM32 40H0V0H32V40Z" fill="#F1ECEC"/>
    </svg>
  )
}

function WindsurfIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 232 137" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M229.812 0.101852H227.602C215.97 0.0837402 206.53 9.50557 206.53 21.1379V68.1836C206.53 77.5783 198.766 85.1883 189.525 85.1883C184.035 85.1883 178.554 82.4251 175.302 77.7867L127.25 9.16132C123.264 3.46292 116.778 0.0656128 109.757 0.0656128C98.8036 0.0656128 88.947 9.37874 88.947 20.8752V68.1927C88.947 77.5874 81.2464 85.1973 71.9424 85.1973C66.4342 85.1973 60.9623 82.4342 57.71 77.7957L3.94208 1.0078C2.72815 -0.722549 0.0012207 0.129028 0.0012207 2.24895V43.2792C0.0012207 45.3538 0.635376 47.3651 1.8222 49.0682L54.7294 124.633C57.8549 129.099 62.4662 132.415 67.7841 133.62C81.0924 136.646 93.3408 126.4 93.3408 113.345V66.0547C93.3408 56.66 100.951 49.0501 110.345 49.0501H110.373C116.035 49.0501 121.344 51.8132 124.596 56.4516L172.647 125.068C176.642 130.775 182.794 134.164 190.132 134.164C201.33 134.164 210.923 124.841 210.923 113.354V66.0456C210.923 56.651 218.533 49.041 227.928 49.041H229.803C230.981 49.041 231.932 48.0898 231.932 46.9121V2.22177C231.932 1.04404 230.981 0.0927887 229.803 0.0927887L229.812 0.101852Z" fill="white"/>
    </svg>
  )
}

function TraeIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 28 21" fill="none">
      <path fill="currentColor" d="M28.002 20.846H4v-3.998H0V.846h28.002zM4 16.848h20.002V4.845H4zm10.002-6.062-2.829 2.828-2.828-2.828 2.828-2.829zm8-.002-2.828 2.828-2.829-2.828 2.829-2.829z"/>
    </svg>
  )
}

function GeminiCLIIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M49.04,24.001l-1.082-0.043h-0.001C36.134,23.492,26.508,13.866,26.042,2.043L25.999,0.96C25.978,0.424,25.537,0,25,0s-0.978,0.424-0.999,0.96l-0.043,1.083C23.492,13.866,13.866,23.492,2.042,23.958L0.96,24.001C0.424,24.022,0,24.463,0,25c0,0.537,0.424,0.978,0.961,0.999l1.082,0.042c11.823,0.467,21.449,10.093,21.915,21.916l0.043,1.083C24.022,49.576,24.463,50,25,50s0.978-0.424,0.999-0.96l0.043-1.083c0.466-11.823,10.092-21.449,21.915-21.916l1.082-0.042C49.576,25.978,50,25.537,50,25C50,24.463,49.576,24.022,49.04,24.001z"/>
    </svg>
  )
}
