(async () => {
  const base = 'http://localhost:8080';
  const log = console.log;
  try {
    const email = `smoke_vendor_${Date.now()}@example.com`;
    const password = 'pass123';

    log('1) Creating vendor:', email);
    let res = await fetch(`${base}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Smoke Vendor', email, password, role: 'VENDOR' })
    });

    if (!res.ok) {
      const body = await res.text();
      log('Create vendor failed', res.status, body);
      process.exit(1);
    }
    const created = await res.json();
    log('Created vendor:', JSON.stringify(created));
    let userId;
    if (created) {
      if (created.user && created.user.id) userId = created.user.id;
      else if (created.id) userId = created.id;
    }
    if (!userId) {
      log('No id returned for created vendor', created);
      process.exit(1);
    }

    log('2) Logging in');
    res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      log('Login failed', res.status, await res.text());
      process.exit(1);
    }
    const logged = await res.json();
    log('Logged in:', JSON.stringify(logged));
    const token = (logged && logged.token) || logged['token'];
    if (!token) {
      log('No token returned on login', logged);
      process.exit(1);
    }

    log('3) Adding product');
    const product = { name: 'Smoke Product', description: 'Smoke test product', price: 9.99, quantity: 5, category: 'Footwear', brand: 'Acme', vendor: { id: userId } };
    res = await fetch(`${base}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(product) });
    if (!res.ok) {
      log('Add product failed', res.status, await res.text());
      process.exit(1);
    }
    const createdProduct = await res.json();
    log('Created product:', JSON.stringify(createdProduct));
    const productId = createdProduct.id || createdProduct['id'];
    if (!productId) {
      log('No id returned for created product', createdProduct);
      process.exit(1);
    }

    log('4) Updating product');
    const updated = { name: 'Smoke Product Updated', price: 19.99, vendor: { id: userId } };
    res = await fetch(`${base}/products/${productId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(updated) });
    if (!res.ok) { log('Update failed', res.status, await res.text()); process.exit(1); }
    const updatedProduct = await res.json();
    log('Updated product:', JSON.stringify(updatedProduct));

    log('5) Deleting product');
    res = await fetch(`${base}/products/${productId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) log('Deleted product', productId); else { log('Delete failed', res.status, await res.text()); process.exit(1); }

    log('6) Verifying deletion (expect 404)');
    res = await fetch(`${base}/products/${productId}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { log('Product still exists after delete:', await res.json()); process.exit(1); } else { log('Verified deletion, status', res.status); }

    log('Smoke test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test error', err);
    process.exit(2);
  }
})();
