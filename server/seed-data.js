const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.approvalStep.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const cat1 = await prisma.category.create({
    data: { name: '工具', nameEn: 'Tools', hasWhitelist: false, needRsaApproval: false, needLegalReview: false, creator: 'admin', editor: '', description: '', remark: '' }
  });
  const cat2 = await prisma.category.create({
    data: { name: '社交类', nameEn: 'Social', hasWhitelist: false, needRsaApproval: false, needLegalReview: false, creator: 'admin', editor: '', description: '', remark: '' }
  });
  const cat3 = await prisma.category.create({
    data: { name: '金融', nameEn: 'Finance', hasWhitelist: false, needRsaApproval: true, needLegalReview: true, creator: 'admin', editor: '', description: '', remark: '' }
  });
  const cat4 = await prisma.category.create({
    data: { name: '游戏', nameEn: 'Game', hasWhitelist: false, needRsaApproval: false, needLegalReview: false, creator: 'admin', editor: '', description: '', remark: '' }
  });

  const now = new Date();

  await prisma.product.create({
    data: {
      name: '测试游戏1',
      packageName: 'com.example.game1',
      packageSize: '128MB',
      categoryId: cat3.id,
      status: 'pending',
      gpLink: 'https://play.google.com/store.apps/details?id=com.example.game1',
      gaLink: 'https://analytics.google.com/analytics/web/#/p123456789/reports/reportinghub',
      gpRating: 4.5,
      settlementType: 'CPA',
      submittedBy: 1,
      attributionWindow: 30,
      shelfStatus: '未上架',
      submitTime: now,
      submitterName: '管理员',
      targetCountries: 'US,UK,CA,AU'
    }
  });

  await prisma.product.create({
    data: {
      name: '测试社交APP',
      packageName: 'com.example.social',
      packageSize: '256MB',
      categoryId: cat2.id,
      status: 'in_progress',
      gpLink: 'https://play.google.com/store.apps/details?id=com.example.social',
      gaLink: 'https://analytics.google.com/analytics/web/#p123456789/reports/reportinghub',
      gpRating: 4.2,
      settlementType: 'CPS',
      submittedBy: 1,
      attributionWindow: 7,
      shelfStatus: '已上架',
      submitTime: now,
      submitterName: '管理员',
      targetCountries: 'US,CN,JP,KR'
    }
  });

  await prisma.product.create({
    data: {
      name: '测试工具APP',
      packageName: 'com.example.tools',
      packageSize: '64MB',
      categoryId: cat1.id,
      status: 'approved',
      gpLink: 'https://play.google.com/store/apps/details?id=com.example.tools',
      gaLink: 'https://analytics.google.com/analytics/web/#p123456789/reports/reportinghub',
      gpRating: 4.8,
      settlementType: 'CPC',
      submittedBy: 1,
      attributionWindow: 14,
      shelfStatus: '已上架',
      submitTime: now,
      submitterName: '管理员',
      targetCountries: 'US,UK,DE,FR'
    }
  });

  await prisma.product.create({
    data: {
      name: '测试游戏2',
      packageName: 'com.example.game2',
      packageSize: '512MB',
      categoryId: cat4.id,
      status: 'rejected',
      gpLink: 'https://play.google.com/store.apps.details?id=com.example.game2',
      gaLink: 'https://analytics.google.com/analytics/web/#p123456789/reports/reportinghub',
      gpRating: 3.9,
      settlementType: 'CPA',
      submittedBy: 1,
      attributionWindow: 30,
      shelfStatus: '未上架',
      submitTime: now,
      submitterName: '管理员',
      targetCountries: 'US,BR,MX,IN'
    }
  });

  const product1 = await prisma.product.findFirst({ where: { name: '测试游戏1' } });
  const product2 = await prisma.product.findFirst({ where: { name: '测试社交APP' } });
  const product3 = await prisma.product.findFirst({ where: { name: '测试工具APP' } });
  const product4 = await prisma.product.findFirst({ where: { name: '测试游戏2' } });

  if (product1) {
    const approval1 = await prisma.approval.create({
      data: { productId: product1.id, categoryId: product1.categoryId, status: 'pending' }
    });
    await prisma.approvalStep.createMany({
      data: [
        { approvalId: approval1.id, productId: product1.id, step: 1, stepType: 'category_review', stepName: '分类审核', status: 'pending' },
        { approvalId: approval1.id, productId: product1.id, step: 2, stepType: 'legal_review', stepName: '法务审核', status: 'pending' },
        { approvalId: approval1.id, productId: product1.id, step: 3, stepType: 'rsa_operation', stepName: 'RSA运营审核', status: 'pending' },
        { approvalId: approval1.id, productId: product1.id, step: 4, stepType: 'rsa_business', stepName: 'RSA商务审核', status: 'pending' },
        { approvalId: approval1.id, productId: product1.id, step: 5, stepType: 'rsa_legal', stepName: 'RSA法务审核', status: 'pending' },
      ]
    });
  }

  if (product2) {
    const approval2 = await prisma.approval.create({
      data: { productId: product2.id, categoryId: product2.categoryId, status: 'in_progress' }
    });
    await prisma.approvalStep.createMany({
      data: [
        { approvalId: approval2.id, productId: product2.id, step: 1, stepType: 'category_review', stepName: '分类审核', status: 'approved', reviewedBy: 1, reviewedAt: now, reviewComment: '分类正确' },
      ]
    });
  }

  if (product3) {
    const approval3 = await prisma.approval.create({
      data: { productId: product3.id, categoryId: product3.categoryId, status: 'approved' }
    });
    await prisma.approvalStep.createMany({
      data: [
        { approvalId: approval3.id, productId: product3.id, step: 1, stepType: 'category_review', stepName: '分类审核', status: 'approved', reviewedBy: 1, reviewedAt: now, reviewComment: '通过' },
      ]
    });
  }

  if (product4) {
    const approval4 = await prisma.approval.create({
      data: { productId: product4.id, categoryId: product4.categoryId, status: 'rejected' }
    });
    await prisma.approvalStep.createMany({
      data: [
        { approvalId: approval4.id, productId: product4.id, step: 1, stepType: 'category_review', stepName: '分类审核', status: 'rejected', reviewedBy: 1, reviewedAt: now, reviewComment: '分类不符合要求' },
      ]
    });
  }

  console.log('Test data created successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
