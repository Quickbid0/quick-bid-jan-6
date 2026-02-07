// Test script to verify dropdown functionality
// Run this in browser console on http://localhost:3022

console.log('🔍 Testing Dropdown Functionality...');

// Test 1: Check if menu items exist
const browseButton = Array.from(document.querySelectorAll('button')).find(btn => 
  btn.textContent?.includes('Browse')
);
const auctionsButton = Array.from(document.querySelectorAll('button')).find(btn => 
  btn.textContent?.includes('Auctions')
);

console.log('✅ Browse button found:', !!browseButton);
console.log('✅ Auctions button found:', !!auctionsButton);

// Test 2: Check if dropdown containers exist
const dropdowns = document.querySelectorAll('.group');
console.log('✅ Dropdown containers found:', dropdowns.length);

// Test 3: Check if dropdown content exists
const dropdownContents = document.querySelectorAll('.absolute');
console.log('✅ Dropdown contents found:', dropdownContents.length);

// Test 4: Simulate hover events
if (browseButton) {
  console.log('🖱️ Testing Browse hover...');
  browseButton.parentElement?.dispatchEvent(new Event('mouseenter', { bubbles: true }));
  setTimeout(() => {
    const browseDropdown = browseButton.parentElement?.querySelector('.absolute');
    if (browseDropdown) {
      const isVisible = browseDropdown.style.opacity !== '0' && !browseDropdown.classList.contains('invisible');
      console.log('✅ Browse dropdown visible on hover:', isVisible);
    }
  }, 100);
}

if (auctionsButton) {
  console.log('🖱️ Testing Auctions hover...');
  auctionsButton.parentElement?.dispatchEvent(new Event('mouseenter', { bubbles: true }));
  setTimeout(() => {
    const auctionsDropdown = auctionsButton.parentElement?.querySelector('.absolute');
    if (auctionsDropdown) {
      const isVisible = auctionsDropdown.style.opacity !== '0' && !auctionsDropdown.classList.contains('invisible');
      console.log('✅ Auctions dropdown visible on hover:', isVisible);
    }
  }, 100);
}

// Test 5: Check links in dropdowns
setTimeout(() => {
  const allLinks = document.querySelectorAll('a');
  const catalogLink = Array.from(allLinks).find(link => link.textContent?.includes('Catalog'));
  const liveAuctionsLink = Array.from(allLinks).find(link => link.textContent?.includes('Live Auctions'));
  
  console.log('✅ Catalog link found:', !!catalogLink);
  console.log('✅ Live Auctions link found:', !!liveAuctionsLink);
  
  if (catalogLink) {
    console.log('🔗 Catalog link href:', catalogLink.getAttribute('href'));
  }
  if (liveAuctionsLink) {
    console.log('🔗 Live Auctions link href:', liveAuctionsLink.getAttribute('href'));
  }
  
  console.log('🎉 Dropdown test complete!');
}, 200);
