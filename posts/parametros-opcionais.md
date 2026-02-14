# Lidando com parâmetros opcionais em Go

Conteúdo de exemplo — substitua por seu artigo real.

Você pode incluir snippets, listas e imagens normalmente.

- Alternativa 1: usar opções (functional options)
- Alternativa 2: criar tipos auxiliares

```go
// Exemplo: opções funcionais
type Option func(*Config)
```