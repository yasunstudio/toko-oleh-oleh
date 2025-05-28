import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping dari filename ke URL UploadThing yang benar berdasarkan log migration
const correctUrlMapping: Record<string, string> = {
  '1748009840197-w2hhy8u2x.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUYteup4U1Wo79l5IVUegz4HcBk3atCNvhpd0M',
  '1748013531132-830fxx0nl.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUzFmUN6lLmCGFT0Kx8jurD9VNnAsWiZ1eXRwk',
  '1748016351254-aj1tk389n.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUHmgPYw6Bcy3bfvCUPsRuTLkw6KM5FH2gd0Aq',
  '1748016351254-bdi4a90n2.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUR3rtThZYOr5VANSI1mcx0KagdJLzD9eMGsRk',
  '1748016351255-w0akxorx5.jpeg': 'https://utfs.io/f/sPrFi2oXJxbU9t1Jcg2sUMFSYi3oxKhfTE0nCJreq2BZyOPb',
  '1748016351256-tiwtkyz9d.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUgB4BJic4Zl7As1YnXTx0hWVMRmJNLHbOwzep',
  '1748017088807-yvntkafog.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUgDIFUkc4Zl7As1YnXTx0hWVMRmJNLHbOwzep',
  '1748017122548-88rvuh5g7.jpeg': 'https://utfs.io/f/sPrFi2oXJxbU5dUhRfjnIjFGvh9qskpiOWMbZtzEUHc0PB5o',
  '1748017297537-bkqzaxh8s.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUyFxB2x4VOCszpZHva8fgKEblBFD2GMrnAY7q',
  '1748017297538-d23d37ous.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUBxTjOaC3ozp10NmrsvEMxDKhZb5RFkTgfUtO',
  '1748017297539-xy4pkscsz.jpeg': 'https://utfs.io/f/sPrFi2oXJxbU5hEDaljnIjFGvh9qskpiOWMbZtzEUHc0PB5o',
  '1748017297540-fjc8xm6w1.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUxGJfu2dCMhvRycmFJATWPogfbYu7ZzHaknSX',
  '1748018706723-9obs93894.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUMfOtSiD8ePRaLIyTzJtN4flDG6jXYHdVKCku',
  '1748021816617-jy3r2elho.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUDOxSvGnQzfCUH7phNWbtDcaeKwx2185l4dmE',
  '1748021914133-iv2prmlrg.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUw3XwaOJA6ebhIOTHXtLdxFWN1MnQ58jViBSE',
  '1748267429848-azyh96888.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUo1J7XB9fWJnx1vD04kyteXFjPUSVHslBc3gZ',
  '1748267429854-1br9ssjsi.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUGzXq6t5wMQCul5kgae4c1NfVBYxHZFpOP36q',
  '1748268493280-y3li7za66.jpeg': 'https://utfs.io/f/sPrFi2oXJxbURaVNkyHZYOr5VANSI1mcx0KagdJLzD9eMGsR',
  '1748268493281-5cvwy7i58.jpeg': 'https://utfs.io/f/sPrFi2oXJxbURawXPHjZYOr5VANSI1mcx0KagdJLzD9eMGsR',
  '1748268493282-6n3dhihqe.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUDwwBBOXnQzfCUH7phNWbtDcaeKwx2185l4dm',
  '1748268493282-eswcfeuvu.jpeg': 'https://utfs.io/f/sPrFi2oXJxbU4hfhpMcWxMkmRO3ydNSwGVcWeLX5tJ8bjoqT',
  '1748355916889-fop1sd7c5.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUTs2NXutWieXILZup5N6th3OsAGqryU8MzFB1',
  '1748355945029-8xqb6y4yr.jpeg': 'https://utfs.io/f/sPrFi2oXJxbURarc3i5ZYOr5VANSI1mcx0KagdJLzD9eMGsR',
  'abon-sapi.jpg': 'https://utfs.io/f/sPrFi2oXJxbUmZjtd4uS5u4IMdNYJwrUVejZqXRBnfF123xv',
  'about-story.jpg': 'https://utfs.io/f/sPrFi2oXJxbUkfgHgFzpaugDd2S9FqtVyroEGKbX3hBO1Cnj',
  'bika-ambon.jpg': 'https://utfs.io/f/sPrFi2oXJxbUZ8kHrqX7z8K6RkBxXHMwrNVtQOvcyWbjoGhq',
  'bumbu-gudeg.jpg': 'https://utfs.io/f/sPrFi2oXJxbUSc3ld4R2wIekqxnNufjELCAlVSy79Ob0ivRZ',
  'bumbu-rendang.jpg': 'https://utfs.io/f/sPrFi2oXJxbUC5XwfJQM7VyZtp1JgWoQcwaHzmY5XNhBd980',
  'category-bumbu.jpg': 'https://utfs.io/f/sPrFi2oXJxbUmZroV21S5u4IMdNYJwrUVejZqXRBnfF123xv',
  'category-gula.jpg': 'https://utfs.io/f/sPrFi2oXJxbU12c9dbTNhFmAVJ2WGcZeaov5RMC0jBETbK8Y',
  'category-keripik.jpg': 'https://utfs.io/f/sPrFi2oXJxbUWZN08JemGFl7bdAQOf1NkgxiSKaITCLszHh0',
  'category-kue-roti.jpg': 'https://utfs.io/f/sPrFi2oXJxbUGaWbmE5wMQCul5kgae4c1NfVBYxHZFpOP36q',
  'category-makanan-basah.jpg': 'https://utfs.io/f/sPrFi2oXJxbUVbgyQdqNTma6zch29VjCuJRZkBwrH3qeFt0x',
  'category-makanan-kering.jpg': 'https://utfs.io/f/sPrFi2oXJxbUyelCsVp4VOCszpZHva8fgKEblBFD2GMrnAY7',
  'category-minuman.jpg': 'https://utfs.io/f/sPrFi2oXJxbUeVJIp7hUSDAReM1rhWbfNFOptYlEjGKInCqL',
  'category-sambal.jpg': 'https://utfs.io/f/sPrFi2oXJxbUMXu7bwD8ePRaLIyTzJtN4flDG6jXYHdVKCku',
  'dendeng-balado.jpg': 'https://utfs.io/f/sPrFi2oXJxbUeQuZcQhUSDAReM1rhWbfNFOptYlEjGKInCqL',
  'dodol-betawi.jpg': 'https://utfs.io/f/sPrFi2oXJxbUnQE4fTrlngVOWfJh6z2ZF1oMvYTapeUcK0AS',
  'gula-aren.jpg': 'https://utfs.io/f/sPrFi2oXJxbUsW3k8poXJxbU0zBPoanACLIEq5g1pdQyFv8r',
  'gula-kelapa.jpg': 'https://utfs.io/f/sPrFi2oXJxbUsLIpnwoXJxbU0zBPoanACLIEq5g1pdQyFv8r',
  'ikan-asin-jambal.jpg': 'https://utfs.io/f/sPrFi2oXJxbUoDHUs19fWJnx1vD04kyteXFjPUSVHslBc3gZ',
  'kemiri-bakar.jpg': 'https://utfs.io/f/sPrFi2oXJxbUtCt42WH74s3APGMEzrZKLNgfueRUYwbcOCQm',
  'keripik-pisang.jpg': 'https://utfs.io/f/sPrFi2oXJxbUzxpdJsilLmCGFT0Kx8jurD9VNnAsWiZ1eXRw',
  'keripik-singkong.jpg': 'https://utfs.io/f/sPrFi2oXJxbUJdAh69UlwqmziVc1BE8IyZ9uQ43knsAxoa7M',
  'keripik-tempe.jpg': 'https://utfs.io/f/sPrFi2oXJxbUpO2LTVvF0gKv4XUMPbndWwSo1TclRaOsVB5f',
  'kerupuk-udang.jpg': 'https://utfs.io/f/sPrFi2oXJxbUMUskSGD8ePRaLIyTzJtN4flDG6jXYHdVKCku',
  'kopi-luwak.jpg': 'https://utfs.io/f/sPrFi2oXJxbUnJJuoKbrlngVOWfJh6z2ZF1oMvYTapeUcK0A',
  'kue-bangkit.jpg': 'https://utfs.io/f/sPrFi2oXJxbUn61btZrlngVOWfJh6z2ZF1oMvYTapeUcK0AS',
  'lapis-legit.jpg': 'https://utfs.io/f/sPrFi2oXJxbU40t0nZWxMkmRO3ydNSwGVcWeLX5tJ8bjoqT0',
  'payment-cmb38m5qy0017svyelwcaco0c-1748152198757.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUtigJSTH74s3APGMEzrZKLNgfueRUYwbcOCQm',
  'payment-cmb3ar3fb000bsvi9eqyjorr3-1748155955323.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUkMhhvRzpaugDd2S9FqtVyroEGKbX3hBO1Cnj',
  'payment-cmb3cnzpk001rsvf3spewszs5-1748158943981.jpeg': 'https://utfs.io/f/sPrFi2oXJxbUg4sYq7lc4Zl7As1YnXTx0hWVMRmJNLHbOwze',
  'payment-proof-1.jpg': 'https://utfs.io/f/sPrFi2oXJxbU1HWyk4VTNhFmAVJ2WGcZeaov5RMC0jBETbK8',
  'payment-proof-2.jpg': 'https://utfs.io/f/sPrFi2oXJxbUbIw1dOgkTi6bOnYsp8mC9eu7vMKwdoq5U1aI',
  'rempeyek-kacang.jpg': 'https://utfs.io/f/sPrFi2oXJxbUkPq7jizpaugDd2S9FqtVyroEGKbX3hBO1Cnj',
  'rendang-kering.jpg': 'https://utfs.io/f/sPrFi2oXJxbUbyCf5sfgkTi6bOnYsp8mC9eu7vMKwdoq5U1a',
  'sambal-matah.jpg': 'https://utfs.io/f/sPrFi2oXJxbUXzErw1aRsnJmwHOcjl6g4L1pZyDESVv95CBU',
  'sambal-oelek.jpg': 'https://utfs.io/f/sPrFi2oXJxbUVpyhVEqNTma6zch29VjCuJRZkBwrH3qeFt0x',
  'sambal-roa.jpg': 'https://utfs.io/f/sPrFi2oXJxbUgZvY3vc4Zl7As1YnXTx0hWVMRmJNLHbOwzep',
  'secang.jpg': 'https://utfs.io/f/sPrFi2oXJxbUWsBsJutemGFl7bdAQOf1NkgxiSKaITCLszHh',
  'teh-pucuk.jpg': 'https://utfs.io/f/sPrFi2oXJxbUr49osVwsI3uqPYovyXZFNRg7MkTJwxDEBOni',
  'wedang-jahe.jpg': 'https://utfs.io/f/sPrFi2oXJxbUEJHhYZmYbSCnLTjr7FHyf04l5dxzZwgeQBkp'
}

async function fixDatabaseUrls() {
  console.log('🔧 Fixing database URLs with correct UploadThing URLs...\n')
  
  let updateCount = 0
  let errorCount = 0
  
  try {
    for (const [filename, correctUrl] of Object.entries(correctUrlMapping)) {
      console.log(`📝 Fixing: ${filename}`)
      
      try {
        // Update ProductImage table
        const productImageUpdates = await prisma.productImage.updateMany({
          where: { 
            url: { contains: filename }
          },
          data: { url: correctUrl }
        })
        
        // Update Category table
        const categoryUpdates = await prisma.category.updateMany({
          where: { 
            image: { contains: filename }
          },
          data: { image: correctUrl }
        })
        
        // Update HeroSlide table
        const heroUpdates = await prisma.heroSlide.updateMany({
          where: { 
            backgroundImage: { contains: filename }
          },
          data: { backgroundImage: correctUrl }
        })
        
        const totalUpdated = productImageUpdates.count + categoryUpdates.count + heroUpdates.count
        
        if (totalUpdated > 0) {
          console.log(`  ✅ Updated ${totalUpdated} record(s) (${productImageUpdates.count} products, ${categoryUpdates.count} categories, ${heroUpdates.count} hero slides)`)
          updateCount += totalUpdated
        } else {
          console.log(`  ⚠️  No records found for ${filename}`)
        }
        
      } catch (error) {
        console.error(`  ❌ Error updating ${filename}:`, error)
        errorCount++
      }
    }
    
  } catch (error) {
    console.error('❌ Fix error:', error)
  } finally {
    await prisma.$disconnect()
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 FIX SUMMARY')
  console.log('=' .repeat(50))
  console.log(`✅ Successfully updated: ${updateCount} records`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('\n🎉 Database URL fix completed!')
}

fixDatabaseUrls()
