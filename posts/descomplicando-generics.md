Coloque aqui o HTML do post **"Descomplicando generics"**. Este arquivo é o conteúdo canônico do post.

Exemplo: explicação breve, código, pontos importantes e conclusão.

```go
// Exemplo simples de generic em Go
func Map[T any](s []T, f func(T) T) []T {
  out := make([]T, len(s))
  for i, v := range s {
    out[i] = f(v)
  }
  return out
}
```
