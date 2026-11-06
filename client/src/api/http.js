export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Сервер недоступен. Проверьте, что бэкенд запущен.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || 'Не удалось выполнить запрос');
  return data;
}
export const saveRecord = (resource, id, data) => request(`/${resource}${id ? `/${id}` : ''}`, {
  method: id ? 'PUT' : 'POST', body: JSON.stringify(data),
});
