export const helpContent = `
<h2>What is JXL Art?</h2>
<p>
  <strong>JXL Art is the practice of using <a href="https://jpeg.org/jpegxl/">JPEG XL</a>'s prediction tree to generate art</strong>.
  If you have questions, join the <code>#jxl-art</code> channel on the <a href="https://discord.gg/DqkQgDRTFu">JPEG XL Discord</a>.
</p>

<p>
  JPEG XL has a modular mode that divides the image into squares called groups (up to 1024x1024 each).
  It uses a prediction tree to predict each pixel's value based on neighboring pixels and gradients.
  Only the <em>difference</em> between the actual image and prediction needs to be encoded.
</p>

<p>
  In JXL art, the error is always zero, so the image consists <em>only</em> of the prediction tree.
  The predictions generate the image. Creating JXL art means writing that prediction tree.
</p>

<h2>Header Options</h2>
<h3>Basic</h3>
<ul>
  <li><code>Width 1024</code> - Image width</li>
  <li><code>Height 1024</code> - Image height</li>
  <li><code>Bitdepth 8</code> - Bit depth (1-31)</li>
  <li><code>Orientation 0-7</code> - Rotation/flip as per EXIF</li>
  <li><code>GroupShift 3</code> - Group size = 128 << value (0-3)</li>
  <li><code>Alpha</code> - Add alpha channel (c == 3)</li>
</ul>

<h3>Color Transforms</h3>
<ul>
  <li><code>RCT 0</code> - Reversible Color Transform (0=RGB, 6=YCoCg, 17=YCgCo-R, up to 42)</li>
  <li><code>XYB</code> - Use XYB perceptual color space (requires Gaborish)</li>
  <li><code>XYBFactors X Y B</code> - Custom XYB multipliers (e.g., <code>XYBFactors 4096 512 256</code>)</li>
  <li><code>CbYCr</code> - Use YCbCr color space</li>
</ul>

<h3>Advanced Processing</h3>
<ul>
  <li><code>16BitBuffers</code> - Use 16-bit internal buffers for higher precision</li>
  <li><code>Gaborish</code> - Apply Gaborish smoothing filter (often used with XYB)</li>
  <li><code>EPF 0-3</code> - Edge-preserving filter strength (0=off, 1-3=increasing)</li>
  <li><code>Squeeze</code> - Apply Squeeze transform for wavelet-like encoding</li>
</ul>

<h3>Multi-frame</h3>
<ul>
  <li><code>FramePos X Y</code> - Frame position offset</li>
  <li><code>NotLast</code> - More layers follow (for multi-layer images)</li>
</ul>

<h2>Decision Nodes</h2>
<pre>if [property] > [value]
  (THEN branch)
  (ELSE branch)</pre>

<h3>Properties for conditions:</h3>
<ul>
  <li><code>c</code> - Channel (0=R/Y, 1=G/Co, 2=B/Cg, 3=A)</li>
  <li><code>g</code> - Group number</li>
  <li><code>x</code>, <code>y</code> - Coordinates within group</li>
  <li><code>N</code>, <code>W</code> - Pixel above / left</li>
  <li><code>|N|</code>, <code>|W|</code> - Absolute values</li>
  <li><code>NW</code>, <code>NE</code> - Diagonal neighbors</li>
  <li><code>W+N-NW</code> - Gradient predictor value</li>
  <li><code>W-NW</code>, <code>NW-N</code>, <code>N-NE</code> - Differences</li>
  <li><code>N-NN</code>, <code>W-WW</code> - Second-order differences</li>
  <li><code>WGH</code> - Weighted predictor error</li>
  <li><code>Prev</code>, <code>PPrev</code> - Previous channel values (for cross-channel prediction)</li>
  <li><code>PrevErr</code>, <code>PPrevErr</code> - Previous channel errors</li>
</ul>

<h2>Leaf Nodes (Predictors)</h2>
<pre>- [predictor] +/- [offset]</pre>

<h3>Available predictors:</h3>
<ul>
  <li><code>Set</code> - Always 0, so offset becomes the absolute value</li>
  <li><code>W</code>, <code>N</code>, <code>NW</code>, <code>NE</code>, <code>WW</code> - Neighbor pixel values</li>
  <li><code>Select</code> - WebP lossless predictor (smart W/N selection)</li>
  <li><code>Gradient</code> - W+N-NW, clamped to valid range</li>
  <li><code>Weighted</code> - Weighted sum of 4 subpredictors (adaptive)</li>
  <li><code>AvgW+N</code>, <code>AvgW+NW</code>, <code>AvgN+NW</code>, <code>AvgN+NE</code> - Averages of neighbors</li>
  <li><code>AvgAll</code> - Weighted sum of multiple neighbors</li>
</ul>

<h2>Edge Cases</h2>
<ul>
  <li>At x=y=0: W=0. At x=0: W=N. At y=0: N=W</li>
  <li>NW falls back to W at edges</li>
  <li>NE, NN fall back to N; WW falls back to W</li>
</ul>

<h2>Tips for Creating Art</h2>
<ul>
  <li>Use <code>c > 0</code> and <code>c > 1</code> to control different color channels</li>
  <li>Combine <code>x</code> and <code>y</code> conditions to create spatial patterns</li>
  <li>Use <code>W</code> and <code>N</code> conditions to create feedback effects</li>
  <li><code>RCT 6</code> (YCoCg) or <code>RCT 17</code> (YCgCo-R) often produce interesting color effects</li>
  <li>Larger images (1024x1024) allow more complex patterns</li>
  <li>The <code>Gradient</code> predictor creates smooth transitions</li>
  <li>The <code>Weighted</code> predictor adapts to local image content</li>
</ul>

<h2>Keyboard Shortcuts</h2>
<ul>
  <li><code>Ctrl+Alt+Enter</code> - Run/Generate</li>
  <li><code>Ctrl+S</code> - Save to browser storage</li>
  <li><code>Ctrl+Shift+F</code> - Format/prettify code</li>
  <li><code>Tab</code> - Insert 2 spaces (in editor)</li>
</ul>

<h2>Example: XYB with Gaborish</h2>
<pre>Bitdepth 8
Width 256
Height 256
Gaborish
16BitBuffers
XYB
XYBFactors 4096 512 256
EPF 2

if c > 1
  - Set 128
if c > 0
  if x > 128
    - Gradient +2
    - N -1
  - Set 200
if y > 128
  - W +1
  - Set 100</pre>
`;
