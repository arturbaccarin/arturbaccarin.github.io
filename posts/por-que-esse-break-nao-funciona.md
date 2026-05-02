Ao trabalhar com loops em Go, existe uma regra essencial que pode facilmente passar despercebida e causar bugs sutis no seu código:

> O `break` sempre encerra a execução da estrutura mais interna entre `for`, `switch` ou `select`.

Isso pode parecer óbvio à primeira vista, mas na prática nem sempre se comporta como esperamos.

## Um exemplo clássico

Considere o código abaixo:

```go
for i := 0; i < 5; i++ {
    fmt.Printf("%d ", i) // 0 1 2 3 4 
    switch i {
    default:
    case 2:
        break
    }
}
```

À primeira vista, pode parecer que o `break` vai interromper o loop `for` quando `i == 2`. Mas não é isso que acontece.

Na verdade, o `break` encerra apenas o `switch`, não o `for`. Ou seja, o loop continua normalmente.

Esse comportamento acontece porque o `switch` é a estrutura mais interna e, como vimos na regra, é ela que será interrompida.

## Como interromper o `for` corretamente?

Para sair do loop `for` a partir de dentro de um `switch` (ou `select`), a forma mais idiomática em Go é usar **labels**:

```go
loop:
for i := 0; i < 5; i++ {
    fmt.Printf("%d ", i) // 0 1 2
    switch i {
    default:
    case 2:
        break loop
    }
}
```

Agora sim, quando `i == 2`, o `break loop` encerra o loop `for` rotulado como `loop`.

## O mesmo problema com `select`

Esse comportamento também aparece com `select`, especialmente em loops infinitos:

```go
for {
    select {
    case <-ch:
        // faz algo
    case <-ctx.Done():
        break
    }
}
```

Aqui, novamente, o `break` não encerra o `for`, apenas o `select`. O loop continuará executando.

### A forma correta

Para interromper o loop externo, usamos novamente um label:

```go
loop:
for {
    select {
    case <-ch:
        // faz algo
    case <-ctx.Done():
        break loop
    }
}
```

## Conclusão

O `break` em Go pode ser traiçoeiro quando usado dentro de estruturas aninhadas. A regra é simples, mas suas consequências nem sempre são óbvias:

- `break` encerra apenas a estrutura mais interna (`for`, `switch` ou `select`)
- Para sair de loops externos, utilize **labels**

Entender esse comportamento evita bugs difíceis de identificar e torna seu código mais previsível e idiomático.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.