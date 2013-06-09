INPUT   := presentation.markdown
OUTPUT  := presentation.pdf
FLAGS   := -t beamer --template template.tex

all: $(OUTPUT)
$(OUTPUT): $(INPUT)
	@pandoc $(FLAGS) $< -o $@
clean:
	@$(RM) $(OUTPUT)
view: $(OUTPUT)
	@open $<
