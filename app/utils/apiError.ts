export function apiError(error: unknown) {
  const response = error as { data?: { error?: { message?: unknown } } }
  return typeof response?.data?.error?.message === 'string' ? response.data.error.message : 'Permintaan gagal. Input Anda dipertahankan; silakan coba kembali.'
}
