// Test the projects API
async function testProjectsAPI() {
  const baseURL = 'http://localhost:3002/api/v2';
  const testUserId = 'test-user-123';

  console.log('🧪 Testing Projects API...\n');

  try {
    // Test 1: Create a project
    console.log('📝 Test 1: Creating a project...');
    const createResponse = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': testUserId
      },
      body: JSON.stringify({
        name: 'Proyecto Test API',
        description: 'Proyecto de prueba para la API',
        client_name: 'Cliente API Test',
        location: 'Buenos Aires',
        calculation_data: {
          protocolosPorTablero: {
            'tablero-1': {
              estado: 'PENDIENTE',
              estructura: {
                '1.1': { estado: 'SI', observacion: 'Test' }
              }
            }
          }
        }
      })
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Project created:', createData.project.name);
      const projectId = createData.project.id;

      // Test 2: Get the created project
      console.log('\n📋 Test 2: Getting the project...');
      const getResponse = await fetch(`${baseURL}/projects/${projectId}`, {
        headers: { 'X-User-ID': testUserId }
      });

      if (getResponse.ok) {
        const getData = await getResponse.json();
        console.log('✅ Project retrieved:', getData.project.name);
        console.log('📊 Protocol data:', Object.keys(getData.project.calculation_data));
      } else {
        console.log('❌ Failed to get project');
      }

      // Test 3: Update the project
      console.log('\n✏️  Test 3: Updating the project...');
      const updateResponse = await fetch(`${baseURL}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': testUserId
        },
        body: JSON.stringify({
          calculation_data: {
            protocolosPorTablero: {
              'tablero-1': {
                estado: 'APROBADO',
                estructura: {
                  '1.1': { estado: 'SI', observacion: 'Actualizado via API' }
                }
              }
            }
          }
        })
      });

      if (updateResponse.ok) {
        const updateData = await updateResponse.json();
        console.log('✅ Project updated successfully');
        console.log('📊 New protocol state:', updateData.project.calculation_data.protocolosPorTablero['tablero-1'].estado);
      } else {
        console.log('❌ Failed to update project');
      }

      // Test 4: Get all projects
      console.log('\n📋 Test 4: Getting all projects...');
      const allResponse = await fetch(`${baseURL}/projects`, {
        headers: { 'X-User-ID': testUserId }
      });

      if (allResponse.ok) {
        const allData = await allResponse.json();
        console.log(`✅ Found ${allData.projects.length} projects for user`);
        allData.projects.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name} (${p.client_name || 'Sin cliente'})`);
        });
      } else {
        console.log('❌ Failed to get all projects');
      }

    } else {
      console.log('❌ Failed to create project');
      const error = await createResponse.json();
      console.log('Error:', error);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProjectsAPI();