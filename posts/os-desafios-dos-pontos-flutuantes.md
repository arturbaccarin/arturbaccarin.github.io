Os números com ponto flutuante (*float*) surgiram da necessidade de representar valores fracionários, algo que os inteiros não são capazes de fazer.

É importante destacar que um *float* é sempre uma **aproximação** de um resultado aritmético real, devido à forma como é representado digitalmente em bits.

Por exemplo, o número **1,0001² = 1,00020001**. Se realizarmos a mesma operação utilizando um **float32**, o resultado será **1,0002**, o que evidencia a perda de casas decimais importantes para a precisão.

### Representação em Go

Em Go, os números de ponto flutuante seguem o padrão **IEEE-754**, que define sua representação interna por meio da divisão dos bits em duas partes principais:

- **Mantissa**: contém os dígitos significativos do número, determinando sua precisão.
- **Expoente**: indica a escala, ou seja, quanto o ponto binário deve ser deslocado para representar valores muito grandes ou muito pequenos.

No caso de um **float32**, temos:

- 1 bit para o sinal (positivo/negativo)
- 8 bits para o expoente
- 23 bits para a mantissa

## Comparações e precisão

A comparação direta entre dois valores de ponto flutuante usando o operador `**==**` pode gerar resultados imprecisos. Isso ocorre porque muitos números decimais não podem ser representados exatamente em binário, levando a pequenas diferenças de arredondamento na memória.

Além disso, o resultado de cálculos em ponto flutuante depende do processador utilizado. Diferentes **FPUs (Floating Point Units)** podem produzir resultados numericamente distintos para os mesmos cálculos. Por isso, utilizar uma **delta (tolerância)** é a abordagem mais segura para comparações, garantindo consistência entre máquinas e arquiteturas diferentes.

## A ordem das operações importa

Outro ponto de atenção é a ordem das operações. Em cálculos de adição, subtração, multiplicação ou divisão, a sequência escolhida influencia diretamente a precisão do resultado. Por exemplo:

```go
func main() {
	a := 1e16 // big number
	b := 1.0  // small numver
	c := 3.14159265

	// Ordem 1: (a + b) * c
	result1 := (a + b) * c

	// Ordem 2: a*c + b*c
	result2 := a*c + b*c

	fmt.Println(result1)                     // output: 3.1415926500000004e+16
	fmt.Println(result2)                     // output: 3.141592650000001e+16
	fmt.Println(math.Abs(result1 - result2)) // output: 4.0000000000
}
```

- `(a + b) * c` → ao somar `a + b`, o valor de `b` é perdido devido à precisão limitada do float64.
- `a*c + b*c` → o cálculo de `b*c` é feito separadamente, preservando sua contribuição.

Em geral, realizar primeiro as operações de multiplicação e divisão tende a produzir resultados mais precisos, pois reduz a propagação de erros de arredondamento.

Os números de ponto flutuante são indispensáveis para representar valores fracionários e realizar cálculos numéricos em Go e em diversas linguagens de programação. No entanto, compreender suas limitações é essencial: eles não oferecem exatidão absoluta, mas sim aproximações que variam conforme a representação binária e a arquitetura do processador.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.