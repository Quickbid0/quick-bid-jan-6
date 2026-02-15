import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedQuickMelaData() {
  console.log('🌱 Starting QuickMela database seeding...');

  try {
    // Create Branches
    console.log('🏢 Creating branches...');
    const branches = await Promise.all([
      prisma.branch.upsert({
        where: { code: 'HQDL' },
        update: {},
        create: {
          name: 'QuickMela Headquarters',
          code: 'HQDL',
          type: 'HEAD_OFFICE',
          address: '123 Tech Park, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '+91-11-12345678',
          email: 'hq@quickmela.com'
        }
      }),
      prisma.branch.upsert({
        where: { code: 'HYD01' },
        update: {},
        create: {
          name: 'Hyderabad Main Branch',
          code: 'HYD01',
          type: 'REGULAR',
          address: '456 Jubilee Hills, Hyderabad',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500033',
          phone: '+91-40-12345678',
          email: 'hyderabad@quickmela.com'
        }
      }),
      prisma.branch.upsert({
        where: { code: 'MUM01' },
        update: {},
        create: {
          name: 'Mumbai Auction Branch',
          code: 'MUM01',
          type: 'REGULAR',
          address: '789 Bandra West, Mumbai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          phone: '+91-22-12345678',
          email: 'mumbai@quickmela.com'
        }
      }),
      prisma.branch.upsert({
        where: { code: 'BLR01' },
        update: {},
        create: {
          name: 'Bangalore Premium Branch',
          code: 'BLR01',
          type: 'REGULAR',
          address: '321 Koramangala, Bangalore',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
          phone: '+91-80-12345678',
          email: 'bangalore@quickmela.com'
        }
      })
    ]);

    console.log(`✅ Created ${branches.length} branches`);

    // Assign branch staff
    console.log('👥 Assigning branch staff...');

    // Assign admin to Hyderabad branch
    const admin = await prisma.user.findUnique({ where: { email: 'admin@quickmela.com' } });
    if (admin) {
      await prisma.branchStaff.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
          userId: admin.id,
          branchId: branches[1].id, // Hyderabad branch
          role: 'MANAGER',
          permissions: ['approve_products', 'manage_staff', 'view_reports', 'manage_deliveries']
        }
      });
    }

    // Assign delivery agent to Hyderabad branch
    const deliveryAgent = await prisma.user.findUnique({ where: { email: 'agent.hyderabad@quickmela.com' } });
    if (deliveryAgent) {
      await prisma.branchStaff.upsert({
        where: { userId: deliveryAgent.id },
        update: {},
        create: {
          userId: deliveryAgent.id,
          branchId: branches[1].id, // Hyderabad branch
          role: 'AGENT',
          permissions: ['pickup_deliveries', 'update_tracking']
        }
      });
    }

    console.log('✅ Branch staff assigned');

    // Create sample products for different categories
    console.log('📦 Creating sample products...');

    const hyderabadSeller = await prisma.user.findUnique({ where: { email: 'seller.hyderabad@quickmela.com' } });
    const mumbaiSeller = await prisma.user.findUnique({ where: { email: 'seller.mumbai@quickmela.com' } });

    if (hyderabadSeller) {
      const products = await Promise.all([
        // Electronics
        prisma.product.upsert({
          where: { id: 'electronics-iphone-14' },
          update: {},
          create: {
            id: 'electronics-iphone-14',
            title: 'iPhone 14 Pro Max - Brand New',
            description: 'Latest iPhone 14 Pro Max with 256GB storage. Comes with original accessories and warranty.',
            category: 'ELECTRONICS',
            subcategory: 'Smartphones',
            condition: 'NEW',
            price: 129900,
            images: [
              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
              'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=500'
            ],
            videoUrl: 'https://example.com/videos/iphone-unboxing.mp4',
            sellerId: hyderabadSeller.id,
            status: 'APPROVED',
            branchId: branches[1].id,
            depositAmount: 250
          }
        }),

        // Vehicles
        prisma.product.upsert({
          where: { id: 'vehicle-honda-city' },
          update: {},
          create: {
            id: 'vehicle-honda-city',
            title: 'Honda City 2022 - Single Owner',
            description: 'Honda City 2022 model with 15,000 km driven. Single owner, all service records available.',
            category: 'VEHICLES',
            subcategory: 'Sedan',
            condition: 'EXCELLENT',
            price: 850000,
            images: [
              'https://images.unsplash.com/photo-1549399735-cef2e2c3f638?w=500',
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
            ],
            sellerId: hyderabadSeller.id,
            status: 'APPROVED',
            branchId: branches[1].id,
            depositAmount: 300
          }
        }),

        // Handmade Art
        prisma.product.upsert({
          where: { id: 'handmade-oil-painting' },
          update: {},
          create: {
            id: 'handmade-oil-painting',
            title: 'Original Oil Painting - Hyderabad Skyline',
            description: 'Handcrafted oil painting depicting the beautiful Hyderabad skyline at sunset.',
            category: 'HANDMADE_ART',
            subcategory: 'Paintings',
            condition: 'NEW',
            price: 25000,
            images: [
              'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
              'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500'
            ],
            handmadeProofVideo: 'https://example.com/videos/painting-process.mp4',
            isHandmade: true,
            handmadeRating: 4.8,
            sellerId: hyderabadSeller.id,
            status: 'APPROVED',
            branchId: branches[1].id,
            depositAmount: 200
          }
        })
      ]);

      console.log(`✅ Created ${products.length} products for Hyderabad seller`);
    }

    if (mumbaiSeller) {
      const products = await Promise.all([
        // Gold & Jewellery
        prisma.product.upsert({
          where: { id: 'gold-necklace-22k' },
          update: {},
          create: {
            id: 'gold-necklace-22k',
            title: '22K Gold Necklace - Traditional Design',
            description: 'Beautiful 22K gold necklace weighing 50 grams. Hallmarked and certified.',
            category: 'GOLD_JEWELLERY',
            subcategory: 'Necklaces',
            condition: 'NEW',
            price: 185000,
            images: [
              'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
              'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'
            ],
            sellerId: mumbaiSeller.id,
            status: 'APPROVED',
            branchId: branches[2].id,
            depositAmount: 300
          }
        }),

        // Real Estate
        prisma.product.upsert({
          where: { id: 'real-estate-2bhk-mumbai' },
          update: {},
          create: {
            id: 'real-estate-2bhk-mumbai',
            title: '2BHK Flat in Andheri West - Ready to Move',
            description: '2BHK apartment in prime location, fully furnished, parking included.',
            category: 'REAL_ESTATE',
            subcategory: 'Residential',
            condition: 'NEW',
            price: 7500000,
            images: [
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500',
              'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=500'
            ],
            sellerId: mumbaiSeller.id,
            status: 'APPROVED',
            branchId: branches[2].id,
            depositAmount: 300
          }
        })
      ]);

      console.log(`✅ Created ${products.length} products for Mumbai seller`);
    }

    // Create auctions for approved products
    console.log('🏷️ Creating auctions...');

    const approvedProducts = await prisma.product.findMany({
      where: { status: 'APPROVED' }
    });

    for (const product of approvedProducts) {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.auction.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          sellerId: product.sellerId,
          auctionType: product.category === 'VEHICLES' ? 'RESERVE' :
                      product.category === 'REAL_ESTATE' ? 'TIMED' : 'FLASH',
          startPrice: product.price * 0.8, // 20% below retail
          reservePrice: product.category === 'VEHICLES' ? product.price * 0.9 : undefined,
          bidIncrement: product.price > 100000 ? 5000 : product.price > 10000 ? 1000 : 100,
          startTime,
          endTime,
          status: 'ACTIVE',
          views: Math.floor(Math.random() * 100) + 10,
          totalBids: Math.floor(Math.random() * 20) + 5,
          uniqueBidders: Math.floor(Math.random() * 10) + 3
        }
      });
    }

    console.log(`✅ Created auctions for ${approvedProducts.length} products`);

    // Create sample reviews
    console.log('⭐ Creating sample reviews...');

    const buyers = await prisma.user.findMany({ where: { role: 'BUYER' } });
    const reviewedProducts = await prisma.product.findMany({ take: 3 });

    for (let i = 0; i < reviewedProducts.length; i++) {
      const product = reviewedProducts[i];
      const buyer = buyers[i % buyers.length];

      await prisma.review.create({
        data: {
          productId: product.id,
          reviewerId: buyer.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          title: 'Great product quality!',
          comment: 'Very satisfied with the purchase. Product exactly as described.',
          images: i % 2 === 0 ? ['https://example.com/review-image.jpg'] : []
        }
      });
    }

    console.log('✅ Sample reviews created');

    console.log('🎉 QuickMela database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${branches.length} branches created`);
    console.log(`   - ${approvedProducts.length} products created`);
    console.log(`   - ${approvedProducts.length} auctions created`);
    console.log('   - Sample reviews added');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedQuickMelaData()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
