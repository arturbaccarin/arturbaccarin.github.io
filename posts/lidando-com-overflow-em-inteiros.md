No Go existem **10 formas de declarar variáveis inteiras**, cada uma com capacidade de armazenamento diferente:

- **int8 (8 bits)** → -128 a 127
- **int16 (16 bits)** → -32.768 a 32.767
- **int32 (32 bits)** → -2.147.483.648 a 2.147.483.647
- **int64 (64 bits)** → -9.223.372.036.854.775.808 a 9.223.372.036.854.775.807
- **uint8 (8 bits)** → 0 a 255
- **uint16 (16 bits)** → 0 a 65.535
- **uint32 (32 bits)** → 0 a 4.294.967.295
- **uint64 (64 bits)** → 0 a 18.446.744.073.709.551.615

Além desses, existem os tipos **int** e **uint**, sem especificação de tamanho. Seu tamanho depende da arquitetura do sistema:

- Em sistemas **32 bits** → 32 bits
- Em sistemas **64 bits** → 64 bits

> A recomendação é usar `int` por padrão, a menos que haja necessidade específica de um tipo com tamanho fixo ou sem sinal.

Essa escolha é feita **em tempo de compilação**.

### Overflow (Estouro de Memória)

O **overflow** ocorre quando se tenta armazenar um valor maior (ou menor) do que a capacidade da variável. Exemplo: salvar o valor `128` em um `int8`.

```go
var x int8 = 128
// Erro de compilação: cannot use 128 (untyped int constant) as int8 value in variable declaration (overflows)
```

No entanto, em **tempo de execução** o comportamento é silencioso e pode gerar erros:

```go
var x int8 = 127
x++
println(x) // saída: -128
```

### Como prevenir overflow?

O pacote padrão `math` fornece constantes com os valores **máximos e mínimos** de cada tipo, como:

- `math.MaxInt32`
- `math.MaxUint64`
- `math.MinInt16`
- `math.MaxInt` / `math.MinInt` (dependentes do sistema)

#### 1. Incremento seguro

```go
func Inc32(counter int32) int32 {
    if counter == math.MaxInt32 {
        panic("int32 overflow")
    }
    return counter + 1
}
```

#### 2. Soma segura

```go
func AddInt(a, b int) int {
    if a > math.MaxInt-b {
        panic("int overflow")
    }
    return a + b
}
```

#### 3. Multiplicação segura

```go
func MultiplyInt(a, b int) int {
    if a == 0 || b == 0 {
        return 0
    }
    result := a * b
    if a == 1 || b == 1 {
        return result
    }
    if a == math.MinInt || b == math.MinInt {
        panic("integer overflow")
    }
    if result/b != a {
        panic("integer overflow")
    }
    return result
}
```

Por fim, quando for necessário manipular valores além dos limites permitidos pelos tipos nativos, como em aplicações de criptografia ou cálculos científicos, o Go oferece o pacote nativo **math/big**. Esse pacote fornece tipos numéricos capazes de representar e manipular inteiros, racionais e números de ponto flutuante com **precisão arbitrária**, ou seja, sem as restrições de tamanho impostas por tipos como `int64` ou `float64`.

Ele disponibiliza estruturas como **big.Int**, **big.Rat** e **big.Float**, que suportam operações matemáticas avançadas (soma, subtração, multiplicação, divisão, exponenciação, comparações etc.), todas seguindo regras de precisão controlada.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.